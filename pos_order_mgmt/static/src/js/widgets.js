/* Copyright 2018 GRAP - Sylvain LE GAL
   Copyright 2018 Tecnativa - David Vidal
   Copyright 2019 Druidoo - Ivan Todorovich
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_order_mgmt.widgets", function(require) {
    "use strict";

    var core = require("web.core");
    var _t = core._t;
    var PosBaseWidget = require("point_of_sale.BaseWidget");
    var screens = require("point_of_sale.screens");
    var gui = require("point_of_sale.gui");
    var chrome = require("point_of_sale.chrome");
    var models = require("point_of_sale.models");

    var QWeb = core.qweb;
    var ScreenWidget = screens.ScreenWidget;
    var DomCache = screens.DomCache;

    screens.ReceiptScreenWidget.include({
        render_receipt: function() {
            if (!this.pos.reloaded_order) {
                return this._super();
            }
            var order = this.pos.reloaded_order;
            this.$(".pos-receipt-container").html(
                QWeb.render("OrderReceipt", {
                    widget: this,
                    pos: this.pos,
                    order: order,
                    receipt: order.export_for_printing(),
                    orderlines: order.get_orderlines(),
                    paymentlines: order.get_paymentlines(),
                })
            );
            this.pos.from_loaded_order = true;
        },
        click_next: function() {
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
        template: "OrderListScreenWidget",

        init: function(parent, options) {
            this._super(parent, options);
            this.order_cache = new DomCache();
            this.orders = [];
            this.unknown_products = [];
            this.search_query = false;
            this.perform_search();
        },

        auto_back: true,

        show: function() {
            var self = this;
            var previous_screen = false;
            if (this.pos.get_order()) {
                previous_screen = this.pos
                    .get_order()
                    .get_screen_data("previous-screen");
            }
            if (previous_screen === "receipt") {
                this.gui.screen_instances.receipt.click_next();
                this.gui.show_screen("orderlist");
            }
            this._super();
            this.renderElement();
            this.old_order = this.pos.get_order();
            this.$(".back").click(function() {
                return self.gui.show_screen(self.gui.startup_screen);
            });

            if (this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard) {
                this.chrome.widget.keyboard.connect(this.$(".searchbox input"));
            }

            var search_timeout = null;
            this.$(".searchbox input").on("keyup", function() {
                self.search_query = this.value;
                clearTimeout(search_timeout);
                search_timeout = setTimeout(function() {
                    self.perform_search();
                }, 70);
            });

            this.$(".searchbox .search-clear").click(function() {
                self.clear_search();
            });

            this.perform_search();
        },

        render_list: function() {
            var self = this;
            var orders = this.orders;
            var contents = this.$el[0].querySelector(".order-list-contents");
            contents.innerHTML = "";
            for (var i = 0, len = Math.min(orders.length, 1000); i < len; i++) {
                var order = orders[i];
                var orderline = this.order_cache.get_node(order.id || order.uid);
                if (!orderline) {
                    var orderline_html = QWeb.render("OrderLine", {
                        widget: this,
                        order: order,
                    });
                    orderline = document.createElement("tbody");
                    orderline.innerHTML = orderline_html;
                    orderline = orderline.childNodes[1];
                    this.order_cache.cache_node(order.id || order.uid, orderline);
                }
                if (order === this.old_order) {
                    orderline.classList.add("highlight");
                } else {
                    orderline.classList.remove("highlight");
                }
                contents.appendChild(orderline);
            }
            // FIXME: Everytime the list is rendered we need to reassing the
            // button events.
            this.$(".order-list-return").off("click");
            this.$(".order-list-reprint").off("click");
            this.$(".order-list-copy").off("click");
            this.$(".order-list-reprint").click(function(event) {
                self.order_list_actions(event, "print");
            });
            this.$(".order-list-copy").click(function(event) {
                self.order_list_actions(event, "copy");
            });
            this.$(".order-list-return").click(function(event) {
                self.order_list_actions(event, "return");
            });
        },

        order_list_actions: function(event, action) {
            var self = this;
            var dataset = event.target.parentNode.dataset;
            self.load_order_data(parseInt(dataset.orderId, 10)).then(function(
                order_data
            ) {
                self.order_action(order_data, action);
            });
        },

        order_action: function(order_data, action) {
            if (this.old_order !== null) {
                this.gui.back();
            }
            var order = this.load_order_from_data(order_data, action);
            if (!order) {
                // The load of the order failed. (products not found, ...
                // We cancel the action
                return;
            }
            this["action_" + action](order_data, order);
        },

        action_print: function(order_data, order) {
            // We store temporarily the current order so we can safely compute
            // taxes based on fiscal position
            this.pos.current_order = this.pos.get_order();

            this.pos.set_order(order);

            this.pos.reloaded_order = order;
            var skip_screen_state = this.pos.config.iface_print_skip_screen;
            // Disable temporarily skip screen if set
            this.pos.config.iface_print_skip_screen = false;
            this.gui.show_screen("receipt");
            this.pos.reloaded_order = false;
            // Set skip screen to whatever previous state
            this.pos.config.iface_print_skip_screen = skip_screen_state;

            // If it's invoiced, we also print the invoice
            if (order_data.to_invoice) {
                this.pos.chrome.do_action("point_of_sale.pos_invoice_report", {
                    additional_context: {active_ids: [order_data.id]},
                });
            }

            // Destroy the order so it's removed from localStorage
            // Otherwise it will stay there and reappear on browser refresh
            order.destroy();
        },

        action_copy: function(order_data, order) {
            order.trigger("change");
            this.pos.get("orders").add(order);
            this.pos.set("selectedOrder", order);
            return order;
        },

        action_return: function(order_data, order) {
            order.trigger("change");
            this.pos.get("orders").add(order);
            this.pos.set("selectedOrder", order);
            return order;
        },

        _prepare_order_from_order_data: function(order_data, action) {
            var self = this;
            var order = new models.Order(
                {},
                {
                    pos: this.pos,
                }
            );

            // Get Customer
            if (order_data.partner_id) {
                order.set_client(this.pos.db.get_partner_by_id(order_data.partner_id));
            }

            // Get fiscal position
            if (order_data.fiscal_position && this.pos.fiscal_positions) {
                var fiscal_positions = this.pos.fiscal_positions;
                order.fiscal_position = fiscal_positions.filter(function(p) {
                    return p.id === order_data.fiscal_position;
                })[0];
                order.trigger("change");
            }

            // Get order lines
            self._prepare_orderlines_from_order_data(order, order_data, action);

            // Get Name
            if (["print"].indexOf(action) !== -1) {
                order.name = order_data.pos_reference;
            } else if (["return"].indexOf(action) !== -1) {
                order.name = _t("Refund ") + order.uid;
            }

            // Get to invoice
            if (["return", "copy"].indexOf(action) !== -1) {
                // If previous order was invoiced, we need a refund too
                order.set_to_invoice(order_data.to_invoice);
            }

            // Get returned Order
            if (["print"].indexOf(action) !== -1) {
                // Get the same value as the original
                order.returned_order_id = order_data.returned_order_id;
                order.returned_order_reference = order_data.returned_order_reference;
            } else if (["return"].indexOf(action) !== -1) {
                order.returned_order_id = order_data.id;
                order.returned_order_reference = order_data.pos_reference;
            }

            // Get Date
            if (["print"].indexOf(action) !== -1) {
                order.formatted_validation_date = moment(order_data.date_order).format(
                    "YYYY-MM-DD HH:mm:ss"
                );
            }

            // Get Payment lines
            if (["print"].indexOf(action) !== -1) {
                var paymentLines = order_data.statement_ids || [];
                _.each(paymentLines, function(paymentLine) {
                    var line = paymentLine;
                    // In case of local data
                    if (line.length === 3) {
                        line = line[2];
                    }
                    _.each(self.pos.cashregisters, function(cashregister) {
                        if (cashregister.journal.id === line.journal_id) {
                            if (line.amount > 0) {
                                // If it is not change
                                order.add_paymentline(cashregister);
                                order.selected_paymentline.set_amount(line.amount);
                            }
                        }
                    });
                });
            }
            return order;
        },

        _prepare_orderlines_from_order_data: function(order, order_data, action) {
            var orderLines = order_data.line_ids || order_data.lines || [];

            var self = this;
            _.each(orderLines, function(orderLine) {
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
                    order.add_product(
                        product,
                        self._prepare_product_options_from_orderline_data(
                            order,
                            line,
                            action
                        )
                    );
                    // Restore lot information.
                    if (["return"].indexOf(action) !== -1) {
                        var orderline = order.get_selected_orderline();
                        if (orderline.pack_lot_lines) {
                            _.each(orderline.return_pack_lot_names, function(lot_name) {
                                orderline.pack_lot_lines.add(
                                    new models.Packlotline(
                                        {lot_name: lot_name},
                                        {order_line: orderline}
                                    )
                                );
                            });
                            orderline.trigger("change", orderline);
                        }
                    }
                }
            });
        },

        _prepare_product_options_from_orderline_data: function(order, line, action) {
            var qty = line.qty;
            if (["return"].indexOf(action) !== -1) {
                // Invert line quantities
                qty *= -1;
            }
            return {
                price: line.price_unit,
                quantity: qty,
                discount: line.discount,
                merge: false,
                extras: {
                    return_pack_lot_names: line.pack_lot_names,
                },
            };
        },

        load_order_data: function(order_id) {
            var self = this;
            return this._rpc({
                model: "pos.order",
                method: "load_done_order_for_pos",
                args: [order_id],
            }).catch(function(error) {
                if (parseInt(error.code, 10) === 200) {
                    // Business Logic Error, not a connection problem
                    self.gui.show_popup("error-traceback", {
                        title: error.data.message,
                        body: error.data.debug,
                    });
                } else {
                    self.gui.show_popup("error", {
                        title: _t("Connection error"),
                        body: _t(
                            "Can not execute this action because the POS" +
                                " is currently offline"
                        ),
                    });
                }
            });
        },

        load_order_from_data: function(order_data, action) {
            var self = this;
            this.unknown_products = [];
            var order = self._prepare_order_from_order_data(order_data, action);
            // Forbid POS Order loading if some products are unknown
            if (self.unknown_products.length > 0) {
                self.gui.show_popup("error-traceback", {
                    title: _t("Unknown Products"),
                    body:
                        _t(
                            "Unable to load some order lines because the " +
                                "products are not available in the POS cache.\n\n" +
                                "Please check that lines :\n\n  * "
                        ) + self.unknown_products.join("; \n  *"),
                });
                return false;
            }
            return order;
        },

        // Search Part
        search_done_orders: function(query) {
            var self = this;
            return this._rpc({
                model: "pos.order",
                method: "search_done_orders_for_pos",
                args: [query || "", this.pos.pos_session.id],
            })
                .then(function(result) {
                    self.orders = result;
                    // Get the date in local time
                    _.each(self.orders, function(order) {
                        if (order.date_order) {
                            order.date_order = moment
                                .utc(order.date_order)
                                .local()
                                .format("YYYY-MM-DD HH:mm:ss");
                        }
                    });
                })
                .catch(function(error, event) {
                    if (parseInt(error.code, 10) === 200) {
                        // Business Logic Error, not a connection problem
                        self.gui.show_popup("error-traceback", {
                            title: error.data.message,
                            body: error.data.debug,
                        });
                    } else {
                        self.gui.show_popup("error", {
                            title: _t("Connection error"),
                            body: _t(
                                "Can not execute this action because the POS" +
                                    " is currently offline"
                            ),
                        });
                    }
                    event.preventDefault();
                });
        },

        perform_search: function() {
            var self = this;
            return this.search_done_orders(self.search_query).then(function() {
                self.render_list();
            });
        },

        clear_search: function() {
            var self = this;
            self.$(".searchbox input")[0].value = "";
            self.$(".searchbox input").focus();
            self.search_query = false;
            self.perform_search();
        },
    });

    gui.define_screen({
        name: "orderlist",
        widget: OrderListScreenWidget,
    });

    var ListOrderButtonWidget = PosBaseWidget.extend({
        template: "ListOrderButtonWidget",
        init: function(parent, options) {
            var opts = options || {};
            this._super(parent, opts);
            this.action = opts.action;
            this.label = opts.label;
        },

        button_click: function() {
            this.gui.show_screen("orderlist");
        },

        renderElement: function() {
            var self = this;
            this._super();
            this.$el.click(function() {
                self.button_click();
            });
        },
    });

    var widgets = chrome.Chrome.prototype.widgets;
    widgets.push({
        name: "list_orders",
        widget: ListOrderButtonWidget,
        prepend: ".pos-rightheader",
        args: {
            label: "All Orders",
        },
    });

    return {
        ListOrderButtonWidget: ListOrderButtonWidget,
        OrderListScreenWidget: OrderListScreenWidget,
    };
});
