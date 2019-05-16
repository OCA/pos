/* Copyright 2018 GRAP - Sylvain LE GAL
   Copyright 2018 Tecnativa - David Vidal
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
odoo.define('pos_order_mgmt.widgets', function (require) {
    "use strict";

    var core = require('web.core');
    var _t = core._t;
    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    var chrome = require('point_of_sale.chrome');
    var pos = require('point_of_sale.models');

    var QWeb = core.qweb;
    var ScreenWidget = screens.ScreenWidget;
    var DomCache = screens.DomCache;

    screens.ReceiptScreenWidget.include({
        render_receipt: function () {
            if (!this.pos.reloaded_order) {
                return this._super();
            }
            var order = this.pos.reloaded_order;
            this.$('.pos-receipt-container').html(QWeb.render('PosTicket', {
                widget: this,
                pos: this.pos,
                order: order,
                receipt: order.export_for_printing(),
                orderlines: order.get_orderlines(),
                paymentlines: order.get_paymentlines(),
            }));
            this.pos.from_loaded_order = true;
        },
        click_next: function () {
            if (!this.pos.from_loaded_order) {
                return this._super();
            }
            this.pos.from_loaded_order = false;
            // When reprinting a loaded order we temporarily set it as the
            // active one. When we get out from the printing screen, we set
            // it back to the one that was active
            if (this.pos.current_order) {
                this.pos.set_order(this.pos.current_order);
                this.pos.current_order = false;
            }
            return this.gui.show_screen(this.gui.startup_screen);
        },
    });

    var OrderListScreenWidget = ScreenWidget.extend({
        template: 'OrderListScreenWidget',

        init: function (parent, options) {
            this._super(parent, options);
            this.order_cache = new DomCache();
            this.orders = [];
            this.unknown_products = [];
            this.search_done_orders();
        },

        auto_back: true,

        show: function () {
            var self = this;
            var previous_screen = this.pos.get_order().get_screen_data('previous-screen');
            if (previous_screen === 'receipt') {
                this.gui.screen_instances.receipt.click_next();
                this.gui.show_screen('orderlist');
            }
            this._super();
            this.renderElement();
            this.old_order = this.pos.get_order();
            this.$('.back').click(function () {
                return self.gui.show_screen(self.gui.startup_screen);
            });
            if (self.orders.length === 0) {
                this.search_done_orders();
            }
            this.render_list();
            var search_timeout = null;
            if (this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard) {
                this.chrome.widget.keyboard.connect(this.$('.searchbox input'));
            }
            this.$('.searchbox input').on('keyup', function (event) {
                clearTimeout(search_timeout);
                var query = this.value;
                search_timeout = setTimeout(function () {
                    self.perform_search(query, event.which === 13);
                }, 70);
            });
            this.$('.searchbox .search-clear').click(function () {
                self.clear_search();
            });
        },

        render_list: function () {
            var self = this;
            var orders = this.orders;
            var contents = this.$el[0].querySelector('.order-list-contents');
            contents.innerHTML = "";
            for (var i = 0, len = Math.min(orders.length, 1000); i < len; i++) {
                var order = orders[i];
                var orderline = this.order_cache.get_node(order.id || order.uid);
                if (!orderline) {
                    var orderline_html = QWeb.render('OrderLine', {
                        widget: this,
                        order: order,
                    });
                    orderline = document.createElement('tbody');
                    orderline.innerHTML = orderline_html;
                    orderline = orderline.childNodes[1];
                    this.order_cache.cache_node(order.id || order.uid, orderline);
                }
                if (order === this.old_order) {
                    orderline.classList.add('highlight');
                } else {
                    orderline.classList.remove('highlight');
                }
                contents.appendChild(orderline);
            }
            // FIXME: Everytime the list is rendered we need to reassing the
            // button events.
            this.$('.order-list-return').off('click');
            this.$('.order-list-reprint').off('click');
            this.$('.order-list-return').click(function (event) {
                self.order_list_actions(event, 'return');
            });
            this.$('.order-list-reprint').click(function (event) {
                self.order_list_actions(event, 'print');
            });
        },

        order_list_actions: function (event, action) {
            var dataset = event.target.parentNode.dataset;
            var self = this;
            if (dataset.orderId) {
                this.load_order(parseInt(dataset.orderId, 10), action);
            } else {
                var local_order = '';
                _.each(this.orders, function (order) {
                    if (order.uid === dataset.uid) {
                        order.return = action === 'return';
                        local_order = self._prepare_order_from_order_data(order);
                    }
                });
                if (local_order) {
                    this['action_' + action](local_order);
                }
            }
        },

        action_print: function (order) {
            var receipt = order.export_for_printing();
            // We store temporarily the current order so we can safely compute
            // taxes based on fiscal position
            this.pos.current_order = this.pos.get_order()
            this.pos.set_order(order);
            if (this.pos.config.iface_print_via_proxy) {
                this.pos.proxy.print_receipt(QWeb.render(
                    'XmlReceipt', {
                        receipt: receipt,
                        widget: this,
                        pos: this.pos,
                        order: order,
                        orderlines: order.get_orderlines(),
                        paymentlines: order.get_paymentlines(),
                    }));
                this.pos.set_order(this.pos.current_order);
                this.pos.current_order = false;
            } else {
                this.pos.reloaded_order = order;
                this.gui.show_screen('receipt');
                this.pos.reloaded_order = false;
            }
        },

        action_return: function (order) {
            this.pos.get('orders').add(order);
            this.pos.set('selectedOrder', order);
            return order;
        },

        _prepare_order_from_order_data: function (order_data) {
            var self = this;
            var order = new pos.Order({}, {
                pos: this.pos,
                temporary: !order_data.return,
            });
            // Set Generic Info
            if (!order_data.return) {
                order.name = order_data.pos_reference || order_data.name;
            }
            if (order_data.partner_id.length) {
                order_data.partner_id = order_data.partner_id[0];
            }
            order.set_client(this.pos.db.get_partner_by_id(order_data.partner_id));
            // Set fiscal position
            if (order_data.fiscal_position && this.pos.fiscal_positions) {
                var fiscal_positions = this.pos.fiscal_positions;
                order.fiscal_position = fiscal_positions.filter(function (p) {
                    return p.id === order_data.fiscal_position;
                })[0];
                order.trigger('change');
            }
            // Set order lines
            var orderLines = order_data.line_ids || order_data.lines || [];
            _.each(orderLines, function (orderLine) {
                var line = orderLine;
                // In case of local data
                if (line.length === 3) {
                    line = line[2];
                }
                var product = self.pos.db.get_product_by_id(line.product_id);
                // Check if product are available in pos
                if (_.isUndefined(product)) {
                    self.unknown_products.push(String(line.product_id));
                } else {
                    // Create a new order line
                    order.add_product(product, {
                        price: line.price_unit,
                        quantity: order_data.return ? line.qty * -1 : line.qty,
                        discount: line.discount,
                        merge: false,
                    });
                }
            });
            if (order_data.return) {
                order.return = true;
                // A credit note should be emited if there was an invoice
                order.set_to_invoice(order_data.origin_invoice_id);
                // We'll refunded orders once they are synced
                order.returned_order_id = order_data.id || order_data.name;
                order.origin_name = order_data.pos_reference || order.returned_order_id;
                return order;
            }
            if (order_data.returned_order_id) {
                order.origin_name = order_data.returned_order_id;
            }
            order.formatted_validation_date = moment(order_data.date_order).format('YYYY-MM-DD HH:mm:ss');
            // Set Payment lines
            var paymentLines = order_data.statement_ids || [];
            _.each(paymentLines, function (paymentLine) {
                var line = paymentLine;
                // In case of local data
                if (line.length === 3) {
                    line = line[2];
                }
                _.each(self.pos.cashregisters, function (cashregister) {
                  if (cashregister.journal.id === line.journal_id) {
                        if (line.amount > 0) {
                            // If it is not change
                            order.add_paymentline(cashregister);
                            order.selected_paymentline.set_amount(line.amount);
                        }
                    }
                });
            });
            return order;
        },

        load_order: function (order_id, action) {
            this.unknown_products = [];
            var self = this;
            return this._rpc({
                model: 'pos.order',
                method: 'load_done_order_for_pos',
                args: [order_id],
            }).then(function (order_data) {
                self.gui.back();
                var correct_order_print = true;
                if (action === 'return') {
                    order_data.return = true;
                }
                var order = self._prepare_order_from_order_data(order_data);
                // Forbid POS Order loading if some products are unknown
                if (self.unknown_products.length > 0) {
                    self.gui.show_popup('error-traceback', {
                        'title': _t('Unknown Products'),
                        'body': _t('Unable to load some order lines because the ' +
                            'products are not available in the POS cache.\n\n' +
                            'Please check that lines :\n\n  * ') + self.unknown_products.join("; \n  *"),
                    });
                    correct_order_print = false;
                }
                if (correct_order_print && action === 'print') {
                    self.action_print(order);
                }
                if (correct_order_print && action === 'return') {
                    self.action_return(order);
                }
            }).fail(function (error, event) {
                if (parseInt(error.code, 10) === 200) {
                    // Business Logic Error, not a connection problem
                    self.gui.show_popup(
                        'error-traceback', {
                            'title': error.data.message,
                            'body': error.data.debug,
                        });
                } else {
                    self.gui.show_popup('error', {
                        'title': _t('Connection error'),
                        'body': _t('Can not execute this action because the POS is currently offline'),
                    });
                }
                event.preventDefault();
            });
        },

        // Search Part
        search_done_orders: function (query) {
            var self = this;
            return this._rpc({
                model: 'pos.order',
                method: 'search_done_orders_for_pos',
                args: [query || '', this.pos.pos_session.id],
            }).then(function (result) {
                self.orders = result;
            }).fail(function (error, event) {
                if (parseInt(error.code, 10) === 200) {
                    // Business Logic Error, not a connection problem
                    self.gui.show_popup(
                        'error-traceback', {
                            'title': error.data.message,
                            'body': error.data.debug,
                        }
                    );
                } else {
                    self.gui.show_popup('error', {
                        'title': _t('Connection error'),
                        'body': _t('Can not execute this action because the POS is currently offline'),
                    });
                }
                event.preventDefault();
            });
        },

        perform_search: function (query) {
            var self = this;
            this.search_done_orders(query)
                .done(function () {
                    self.render_list();
                });
        },

        clear_search: function () {
            var self = this;
            this.search_done_orders()
                .done(function () {
                    self.$('.searchbox input')[0].value = '';
                    self.$('.searchbox input').focus();
                    self.render_list();
                });
        },
    });

    gui.define_screen({
        name: 'orderlist',
        widget: OrderListScreenWidget,
    });

    var ListOrderButtonWidget = PosBaseWidget.extend({
        template: 'ListOrderButtonWidget',
        init: function (parent, options) {
            var opts = options || {};
            this._super(parent, opts);
            this.action = opts.action;
            this.label = opts.label;
        },

        button_click: function () {
            this.gui.show_screen('orderlist');
        },

        renderElement: function () {
            var self = this;
            this._super();
            this.$el.click(function () {
                self.button_click();
            });
        },
    });

    var widgets = chrome.Chrome.prototype.widgets;
    widgets.push({
        'name': 'list_orders',
        'widget': ListOrderButtonWidget,
        'prepend': '.pos-rightheader',
        'args': {
            'label': 'All Orders',
        },
    });

    return {
        ListOrderButtonWidget: ListOrderButtonWidget,
        OrderListScreenWidget: OrderListScreenWidget,
    };

});
