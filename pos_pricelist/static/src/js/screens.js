/* Copyright 2018 Tecnativa - Jairo Llopis
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_pricelist.screens", function (require) {
    "use strict";

    var core = require("web.core");
    var screens = require("point_of_sale.screens");
    var _t = core._t;
    var exports = {};

    screens.ScaleScreenWidget.include({
        _get_active_pricelist: function() {
            var current_order = this.pos.get_order();
            var current_pricelist = this.pos.default_pricelist;
            if (current_order) {
                current_pricelist = current_order.pricelist;
            }
            return current_pricelist;
        },

        get_product_price: function () {
            var result = this._super.apply(this, arguments);
            var product = this.get_product();
            if (product) {
                var pricelist = this._get_active_pricelist();
                result = product.get_price(pricelist, this.weight) || result;
            }
            return result;
        },
    });

    screens.DomCache.include({
        init: function () {
            this._super.apply(this, arguments);
            this.key_wrapper = function (key) {
                return key;
            };
        },

        cache_node: function () {
            arguments[0] = this.key_wrapper(arguments[0]);
            return this._super.apply(this, arguments);
        },

        clear_node: function() {
            arguments[0] = this.key_wrapper(arguments[0]);
            return this._super.apply(this, arguments);
        },

        get_node: function() {
            arguments[0] = this.key_wrapper(arguments[0]);
            return this._super.apply(this, arguments);
        },
    });

    screens.ProductListWidget.include({
        init: function () {
            this._super.apply(this, arguments);
            this.pos.get('orders').bind(
                'add remove change',
                $.proxy(this, "renderElement")
            );
            this.pos.bind(
                'change:selectedOrder',
                $.proxy(this, "renderElement")
            );
            this.product_cache.key_wrapper = $.proxy(
                this,
                "calculate_cache_key"
            );
        },

        calculate_cache_key: function (product) {
            var result = product + ',' + this._get_active_pricelist().id;
            return result;
        },

        _get_active_pricelist: function () {
            var current_order = this.pos.get_order();
            var current_pricelist = this.pos.default_pricelist;
            if (current_order) {
                current_pricelist = current_order.pricelist;
            }
            return current_pricelist;
        },
    });

    screens.ClientListScreenWidget.include({
        save_changes: function () {
            if (this.has_client_changed()) {
                var order = this.pos.get_order(),
                    pricelist = false;
                if (this.new_client) {
                    pricelist = _.findWhere(
                        this.pos.pricelists,
                        {'id': this.new_client.property_product_pricelist[0]}
                    );
                }
                order.set_pricelist(pricelist || this.pos.default_pricelist);
            }
            return this._super.apply(this, arguments);
        },
    });

    exports.set_pricelist_button = screens.ActionButtonWidget.extend({
        template: 'SetPricelistButton',
        init: function (parent, options) {
            this._super(parent, options);

            this.pos.get('orders').bind('add remove change', function () {
                this.renderElement();
            }, this);

            this.pos.bind('change:selectedOrder', function () {
                this.renderElement();
            }, this);
        },

        button_click: function () {
            var self = this;

            var pricelists = _.map(self.pos.pricelists, function (pricelist) {
                return {
                    label: pricelist.name,
                    item: pricelist
                };
            });

            self.gui.show_popup('selection', {
                title: _t('Select pricelist'),
                list: pricelists,
                confirm: function (pricelist) {
                    var order = self.pos.get_order();
                    order.set_pricelist(pricelist);
                },
                is_selected: function (pricelist) {
                    return pricelist.id === self.pos.get_order().pricelist.id;
                }
            });
        },

        get_current_pricelist_name: function () {
            var name = _t('Pricelist');
            var order = this.pos.get_order();

            if (order) {
                var pricelist = order.pricelist;

                if (pricelist) {
                    name = pricelist.display_name;
                }
            }
            return name;
        },
    });

    screens.define_action_button({
        'name': 'set_pricelist',
        'widget': exports.set_pricelist_button,
        'condition': function () {
            return this.pos.pricelists.length > 1;
        },
    });

    return exports;
});
