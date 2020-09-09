/** ***************************************************************************
    Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

odoo.define('pos_picking_load.widget', function (require) {
    "use strict";

    var core = require('web.core');
    var framework = require('web.framework');
    var rpc = require('web.rpc');

    var gui = require('point_of_sale.gui');
    var screens = require('point_of_sale.screens');

    var QWeb = core.qweb;
    var _t = core._t;


    /** **********************************************************************
        New ScreenWidget LoadPickingScreenWidget:
            * On show, display all pickings;
            * on click on a picking, display the content;
            * on click on 'validate', allow to use this picking;
            * on click on 'cancel', display the preview screen;
    */
    var LoadPickingScreenWidget = screens.ScreenWidget.extend({
        template: 'LoadPickingScreenWidget',
        auto_back: true,

        current_picking_id: false,
        current_picking_name: false,

        show: function () {
            var self = this;
            this._super();

            this.renderElement();

            // Bind functions
            this.$('.back').click(_.bind(this.clickBackButton, this));
            this.$('.validate').click(_.bind(this.clickValidateButton, this));

            // Initialize display
            this.$('.validate').hide();

            this.search_pickings();

            this.$('.picking-list-contents').delegate(
                '.picking-line', 'click', function (event) {
                    self.select_picking(event);
                });

            // Handle search
            var search_timeout = null;
            this.$('.searchbox input').on('keyup', function () {
                clearTimeout(search_timeout);
                var query = this.value;
                search_timeout = setTimeout(function () {
                    self.perform_search(query);
                }, 70);
            });

            this.$('.searchbox .search-clear').click(function () {
                self.clear_search();
            });

        },

        select_picking: function (event) {
            var origin_picking_id = parseInt(
                event.target.parentNode.dataset.pickingId, 10);
            var self = this;
            this.current_picking_data = false;
            this.$('span.button.validate').hide();
            this.$('.picking-list .highlight').removeClass('highlight');

            framework.blockUI();
            var params = {
                model: 'stock.picking',
                method: 'load_picking_for_pos',
                args: [origin_picking_id],
            };
            rpc.query(params)
                .then(function (picking_data) {
                    framework.unblockUI();
                    if (self.check_picking(picking_data)) {
                        self.current_picking_data = picking_data;
                        $(event.target.parentNode).addClass('highlight');
                        self.$('span.button.validate').show();
                    }
                }).fail(function (error, fail_event) {
                    framework.unblockUI();
                    self.handle_errors(error, fail_event);
                });
        },

        check_picking: function (picking_data) {
            var self = this;

            var picking_selectable = true;

            // Forbid POS Order loading if some products are unknown
            var unknown_products = [];

            picking_data.line_ids.forEach(function (picking_line_data) {
                var line_name = picking_line_data.name.replace('\n', ' ');
                var product = self.pos.db.get_product_by_id(
                    picking_line_data.product_id);
                if (_.isUndefined(product)) {
                    unknown_products.push(line_name);
                }
            });
            if (unknown_products.length > 0) {
                self.gui.show_popup(
                    'error-traceback', {
                        'title': _t('Unknown Products'),
                        'body': _t(
                            "Unable to load some picking lines because the" +
                            " products are not available in the POS" +
                            " cache.\n\n" +
                            "Please check that lines :\n\n  * ") +
                            unknown_products.join("; \n  *"),
                    });
                picking_selectable = false;
            }

            // Check if the partner is unknown
            var partner = self.pos.db.get_partner_by_id(
                picking_data.partner_id);

            if (_.isUndefined(partner)) {
                self.gui.show_popup(
                    'error-traceback', {
                        'title': _t('Unknown Partner'),
                        'body': _t(
                            "Unable to load this picking because the partner" +
                            " is not known in the Point Of Sale" +
                            " as a customer"),
                    });
                picking_selectable = false;
            }

            // Check if the picking is still loaded in another PoS tab
            self.pos.db.get_unpaid_orders().forEach(function (order) {
                if (order.origin_picking_id === picking_data.id) {
                    self.gui.show_popup(
                        'error-traceback', {
                            'title': _t('Picking Still Loaded'),
                            'body': _t(
                                "Unable to load this picking because it has" +
                                " been loaded in another draft" +
                                " PoS Order :\n\n") +
                                order.name,
                        });
                    picking_selectable = false;
                }
            });

            // Check if the picking has still been handled in another PoS Order
            self.pos.db.get_orders().forEach(function (order) {
                if (order.origin_picking_id === picking_data.id) {
                    self.gui.show_popup(
                        'error-traceback', {
                            'title': _t('Picking Still Loaded'),
                            'body': _t(
                                "Unable to load this picking because it has" +
                                " been loaded in another confirmed" +
                                " PoS Order :\n\n") +
                                order.name,
                        });
                    picking_selectable = false;
                }
            });
            return picking_selectable;
        },

        perform_search: function (query) {
            this.search_pickings(query);
        },

        clear_search: function () {
            this.search_pickings();
            this.$('.searchbox input')[0].value = '';
            this.$('.searchbox input').focus();
        },

        search_pickings: function (query) {
            var self = this;
            var params = {
                model: 'stock.picking',
                method: 'search_pickings_for_pos',
                args: [query || '', this.pos.pos_session.id],
            };
            rpc.query(params)
                .then(function (result) {
                    self.render_list(result);
                }).fail(function (error, event) {
                    self.handle_errors(error, event);
                });
        },

        render_list: function (pickings) {
            var contents = this.$el[0].querySelector('.picking-list-contents');
            contents.innerHTML = "";
            var line_list = document.createDocumentFragment();
            _.each(pickings, function (picking) {
                var picking_line_html = QWeb.render(
                    'LoadPickingLine', {widget: this, picking:picking});
                var picking_line = document.createElement('tbody');
                picking_line.innerHTML = picking_line_html;
                picking_line = picking_line.childNodes[1];
                line_list.appendChild(picking_line);
            });
            contents.appendChild(line_list);
        },

        // User Event
        clickBackButton: function () {
            this.gui.back();
        },

        clickValidateButton: function () {
            var order = this.pos.get_order();
            order.load_from_picking_data(this.current_picking_data);
            this.gui.show_screen('products');
        },

        handle_errors: function (error, event) {
            var self = this;
            if (parseInt(error.code, 10) === 200) {
                // Business Logic Error, not a connection problem
                self.gui.show_popup('error-traceback', {
                    'title': error.data.message || _t("Server Error"),
                    'body': error.data.debug || _t(
                        "The server encountered an error while" +
                        " receiving your order."),
                });
            } else {
                self.gui.show_popup('error', {
                    'title': _t('Connection error'),
                    'body': _t(
                        "Can not execute this action because the POS" +
                        " is currently offline"),
                });
            }
            event.preventDefault();
        },
    });

    gui.define_screen({
        'name': 'load_picking',
        'widget': LoadPickingScreenWidget,
        'condition': function () {
            return this.pos.config.iface_load_picking;
        },
    });


    /** **********************************************************************
        New Widget LoadPickingButtonWidget:
            * On click, display a new screen to select a picking;
    */
    var LoadPickingButtonWidget = screens.ActionButtonWidget.extend({
        template: 'LoadPickingButtonWidget',

        button_click: function () {
            if (_.isUndefined(this.pos.get_order().get('origin_picking_id'))) {
                this.gui.show_screen('load_picking');
            } else {
                this.gui.show_popup('error', {
                    'title': _t('Pending Picking'),
                    'body': _t(
                        "A picking is still loaded. You can not load" +
                        " another picking. Please create a new order."),
                });
            }
        },

        button_text: function () {
            if (! this.pos.get_order() ||
                    _.isUndefined(
                        this.pos.get_order().get('origin_picking_id'))) {
                return _t("Load Picking");
            }
            return this.pos.get_order().get('origin_picking_name');
        },

        is_visible: function () {
            if (this.pos.get_order()) {
                return (
                    this.pos.get_order().get_orderlines().length === 0 ||
                    ! _.isUndefined(
                        this.pos.get_order().get('origin_picking_id')));
            }
            return false;
        },

    });

    screens.define_action_button({
        'name': 'load_picking',
        'widget': LoadPickingButtonWidget,
        'condition': function () {
            return this.pos.config.iface_load_picking;
        },
    });

    screens.OrderWidget.include({
        update_summary: function () {
            this._super();
            if (this.getParent().action_buttons &&
                    this.getParent().action_buttons.load_picking) {
                this.getParent().action_buttons.load_picking.renderElement();
            }
        },
    });

    return {
        LoadPickingScreenWidget: LoadPickingScreenWidget,
        LoadPickingButtonWidget: LoadPickingButtonWidget,
    }

});
