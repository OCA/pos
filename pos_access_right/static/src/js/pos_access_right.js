/*
    Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_access_right.pos_access_right", function (require) {
    "use strict";

    var screens = require("point_of_sale.screens");
    var chrome = require("point_of_sale.chrome");
    var models = require("point_of_sale.models");
    var gui = require("point_of_sale.gui");
    var core = require("web.core");
    var DB = require("point_of_sale.DB");
    var _t = core._t;

    // New function 'display_access_right' to display disabled functions
    (gui.Gui.prototype.get_user_groups = function () {
        var self = this;
        if (
            this.pos.get_cashier() &&
            this.pos.user &&
            this.pos.get_cashier().user_id[0] == this.pos.user.id
        ) {
            return this.pos.user;
        }
        return _.find(this.pos.users, function (user_id) {
            if (
                self.pos.get_cashier().user_id &&
                self.pos.get_cashier().user_id[0] == user_id.id
            ) {
                return user_id;
            }
        });
    }),
        (gui.Gui.prototype.display_access_right = function (user) {
            if (!user.groups_id) {
                user = this.get_user_groups();
            }
            if (
                user.groups_id.indexOf(this.pos.config.group_negative_qty_id[0]) === -1
            ) {
                $(".numpad-minus").addClass("pos-disabled-mode");
            } else {
                $(".numpad-minus").removeClass("pos-disabled-mode");
            }
            if (user.groups_id.indexOf(this.pos.config.group_discount_id[0]) === -1) {
                $(".mode-button[data-mode='discount']").addClass("pos-disabled-mode");
            } else {
                $(".mode-button[data-mode='discount']").removeClass(
                    "pos-disabled-mode"
                );
            }
            if (
                user.groups_id.indexOf(
                    this.pos.config.group_change_unit_price_id[0]
                ) === -1
            ) {
                $(".mode-button[data-mode='price']").addClass("pos-disabled-mode");
            } else {
                $(".mode-button[data-mode='price']").removeClass("pos-disabled-mode");
            }
            if (user.groups_id.indexOf(this.pos.config.group_payment_id[0]) === -1) {
                $(".button.pay").addClass("pos-disabled-mode");
            } else {
                $(".button.pay").removeClass("pos-disabled-mode");
            }
        });

    // Overload 'set_cashier' function to display correctly
    // unauthorized function after cashier changed
    var _set_cashier_ = models.PosModel.prototype.set_cashier;
    models.PosModel.prototype.set_cashier = function (user) {
        var user_groups = user;
        if (user.user_id && this.user && user.user_id[0] == this.user.id) {
            user_groups = this.user;
        } else {
            user_groups = _.find(this.users, function (user_id) {
                if (user.user_id && user.user_id[0] == user_id.id) {
                    return user_id;
                }
            });
        }
        if (user_groups) {
            this.gui.display_access_right(user_groups);
        }
        _set_cashier_.call(this, user);
    };
    chrome.OrderSelectorWidget.include({
        /**
         * Click new order
         * @param {MouseEvent} event
         * @param {HTMLElement | jQuery} $el
         */
        neworder_click_handler: function (event, $el) {
            var user = [];
            var self = this;
            var user = this.gui.get_user_groups();
            if (
                !user ||
                !user.groups_id ||
                user.groups_id.indexOf(this.pos.config.group_multi_order_id[0]) === -1
            ) {
                this.gui.show_popup("error", {
                    title: _t("Many Orders - Unauthorized function"),
                    body: _t("Please ask your manager to do it."),
                });
            } else {
                this._super(event, $el);
            }
        },

        /**
         * Click delete order
         * @param {MouseEvent} event
         * @param {HTMLElement | jQuery} $el
         */
        deleteorder_click_handler: function (event, $el) {
            var user = this.gui.get_user_groups();
            if (
                !user ||
                !user.groups_id ||
                user.groups_id.indexOf(this.pos.config.group_delete_order_id[0]) === -1
            ) {
                this.gui.show_popup("error", {
                    title: _t("Delete Order - Unauthorized function"),
                    body: _t("Please ask your manager to do it."),
                });
            } else {
                this._super(event, $el);
            }
        },
    });

    screens.NumpadWidget.include({
        /**
         * To display correctly unauthorized function at the beginning of the
           session, based on current user
         */
        start: function () {
            this._super();
            this.gui.display_access_right(this.pos.get_cashier());
        },

        /**
         * Block '+/-' button if user doesn't belong to the correct group
         * @returns {Object}
         */
        clickSwitchSign: function () {
            var user = this.gui.get_user_groups();
            if (
                !user ||
                !user.groups_id ||
                user.groups_id.indexOf(this.pos.config.group_negative_qty_id[0]) === -1
            ) {
                this.gui.show_popup("error", {
                    title: _t("Negative Quantity - Unauthorized function"),
                    body: _t("Please ask your manager to do it."),
                });
            } else {
                return this._super();
            }
        },

        /**
         * Block 'discount' or 'price' button if user doesn't belong to the
           correct group
         * @param {MouseEvent} event
         * @returns {Object}
         */
        clickChangeMode: function (event) {
            var target = event.currentTarget.attributes["data-mode"];
            var user = this.gui.get_user_groups();
            if (
                target.nodeValue === "discount" &&
                (!user ||
                    !user.groups_id ||
                    user.groups_id.indexOf(this.pos.config.group_discount_id[0]) === -1)
            ) {
                this.gui.show_popup("error", {
                    title: _t("Discount - Unauthorized function"),
                    body: _t("Please ask your manager to do it."),
                });
            } else if (
                target.nodeValue === "price" &&
                (!user ||
                    !user.groups_id ||
                    user.groups_id.indexOf(
                        this.pos.config.group_change_unit_price_id[0]
                    ) === -1)
            ) {
                this.gui.show_popup("error", {
                    title: _t("Change Unit Price - Unauthorized function"),
                    body: _t("Please ask your manager to do it."),
                });
            } else {
                return this._super(event);
            }
        },
    });

    screens.ActionpadWidget.include({
        /**
         * Block 'Payment' button if user doesn't belong to the correct group
         */
        renderElement: function () {
            var self = this;
            this._super();
            this.gui.display_access_right(this.pos.get_cashier());
            var button_pay_click_handler = $._data(
                this.$el.find(".button.pay")[0],
                "events"
            ).click[0].handler;
            this.$(".pay")
                .off("click")
                .click(function () {
                    var user = self.gui.get_user_groups();
                    if (
                        !user ||
                        !user.groups_id ||
                        user.groups_id.indexOf(self.pos.config.group_payment_id[0]) ===
                            -1
                    ) {
                        self.gui.show_popup("error", {
                            title: _t("Payment - Unauthorized function"),
                            body: _t("Please ask your manager to do it."),
                        });
                    } else {
                        button_pay_click_handler();
                    }
                });
        },
    });
});
