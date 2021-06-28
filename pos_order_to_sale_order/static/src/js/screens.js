/** ***************************************************************************
    Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

odoo.define("pos_order_to_sale_order.screens", function(require) {
    "use strict";

    var screens = require("point_of_sale.screens");
    var gui = require("point_of_sale.gui");
    var core = require("web.core");
    var framework = require("web.framework");
    var rpc = require("web.rpc");
    var _t = core._t;

    /** **********************************************************************
        New Widget CreateSaleOrderButtonWidget:
            * On click, display a new screen to select the action to do
    */
    var CreateSaleOrderButtonWidget = screens.ActionButtonWidget.extend({
        template: "CreateSaleOrderButtonWidget",

        button_click: function() {
            if (this.pos.get_order().get_client()) {
                this.gui.show_screen("create_sale_order");
            } else {
                this.gui.show_popup("error", {
                    title: _t("No customer defined"),
                    body: _t(
                        "You should select a customer in order to create" +
                            " a Sale Order."
                    ),
                });
            }
        },

        is_visible: function() {
            return this.pos.get_order().orderlines.length > 0;
        },
    });

    screens.define_action_button({
        name: "create_sale_order",
        widget: CreateSaleOrderButtonWidget,
        condition: function() {
            return this.pos.config.iface_create_sale_order;
        },
    });

    screens.OrderWidget.include({
        update_summary: function() {
            this._super();
            if (
                this.getParent().action_buttons &&
                this.getParent().action_buttons.create_sale_order
            ) {
                this.getParent().action_buttons.create_sale_order.renderElement();
            }
        },
    });

    /** **********************************************************************
        New ScreenWidget CreateSaleOrderScreenWidget:
            * On show, display all buttons, depending on the pos configuration
    */
    var CreateSaleOrderScreenWidget = screens.ScreenWidget.extend({
        template: "CreateSaleOrderScreenWidget",
        auto_back: true,

        show: function() {
            var self = this;
            this._super();

            this.renderElement();

            this.$(".back").click(function() {
                self.gui.back();
            });

            if (!this.pos.config.iface_create_draft_sale_order) {
                this.$("#button-create-draft-order").addClass("oe_hidden");
            }
            if (!this.pos.config.iface_create_confirmed_sale_order) {
                this.$("#button-create-confirmed-order").addClass("oe_hidden");
            }
            if (!this.pos.config.iface_create_delivered_sale_order) {
                this.$("#button-create-delivered-order").addClass("oe_hidden");
            }

            this.$(".paymentmethod").click(function(event) {
                self.click_sale_order_button(
                    event.currentTarget.attributes.action.nodeValue
                );
            });
        },

        click_sale_order_button: function(action) {
            var self = this;
            this.gui.show_popup("confirm", {
                title: _t("Create Sale Order and discard the current" + " PoS Order?"),
                body: _t(
                    "This operation will permanently discard the current PoS" +
                        " Order and create a Sale Order, based on the" +
                        " current order lines."
                ),
                confirm: function() {
                    framework.blockUI();
                    rpc.query({
                        model: "sale.order",
                        method: "create_order_from_pos",
                        args: [self.pos.get("selectedOrder").export_as_JSON(), action],
                    })
                        .then(function() {
                            self.hook_create_sale_order_success();
                        })
                        .catch(function(error, event) {
                            self.hook_create_sale_order_error(error, event);
                        });
                },
            });
        },

        /**
         * Overloadable function to make custom action after Sale order
         * Creation succeeded
         */
        hook_create_sale_order_success: function() {
            framework.unblockUI();
            this.pos.get("selectedOrder").destroy();
        },

        /**
         * Overloadable function to make custom action after Sale order
         * Creation failed
         */
        hook_create_sale_order_error: function(error, event) {
            framework.unblockUI();
            event.preventDefault();
            if (error.code === 200) {
                // Business Logic Error, not a connection problem
                this.gui.show_popup("error-traceback", {
                    title: error.data.message,
                    body: error.data.debug,
                });
            } else {
                // Connexion problem
                this.gui.show_popup("error", {
                    title: _t("The order could not be sent"),
                    body: _t("Check your internet connection and try again."),
                });
            }
        },
    });

    gui.define_screen({
        name: "create_sale_order",
        widget: CreateSaleOrderScreenWidget,
        condition: function() {
            return this.pos.config.iface_create_sale_order;
        },
    });

    return {
        CreateSaleOrderButtonWidget: CreateSaleOrderButtonWidget,
        CreateSaleOrderScreenWidget: CreateSaleOrderScreenWidget,
    };
});
