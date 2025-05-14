odoo.define("pos_membership_extension.models", function (require) {
    "use strict";

    const {Order, Orderline, Product} = require("point_of_sale.models");

    var core = require("web.core");

    var {Gui} = require("point_of_sale.Gui");
    const Registries = require("point_of_sale.Registries");

    var _t = core._t;

    const OverloadProduct = (OriginalProduct) =>
        class extends OriginalProduct {
            /**
             * Return if it's allowed to sell the product to the partner.
             *
             * @param {Order} order to test.
             * @returns {Boolean} True if the sell is allowed, false otherwise.
             */
            get_membership_allowed(order) {
                // No categories means no restriction
                if (this.allowed_membership_category_ids.length === 0) {
                    return true;
                }
                const partner = order.partner;
                // Checks that the partner has a membership category in common with those allowed or
                // that one of the corresponding membership products is in the order lines
                return this.allowed_membership_category_ids.some((categ) => {
                    if (partner && partner.membership_category_ids.includes(categ)) {
                        return true;
                    }

                    return order.orderlines.some(
                        (orderline) =>
                            orderline.product.membership_category_id[0] === categ &&
                            ("partner_for_membership" in orderline
                                ? orderline.partner_for_membership === partner
                                : true)
                    );
                });
            }
        };
    Registries.Model.extend(Product, OverloadProduct);

    const OverloadOrder = (OriginalOrder) =>
        class extends OriginalOrder {
            /**
             * Check if the products of the order lines are allowed.
             * If not, remove according lines and raise a PopUp Error to
             * inform the cashier of the removal.
             */
            _remove_non_allowed_orderlines() {
                var self = this;
                var bad_product_list = [];
                var i = this.orderlines.length;
                while (i--) {
                    var orderline = this.orderlines[i];
                    if (!orderline.product.get_membership_allowed(self)) {
                        bad_product_list.push(orderline.product.display_name);
                        this.orderlines.splice(i, 1);
                    }
                }
                if (bad_product_list.length !== 0) {
                    var bad_product_text = bad_product_list.join(", ");
                    Gui.showPopup("ErrorPopup", {
                        title: _t("Order Line Removal"),
                        body: _t(
                            `The following lines has been removed, as the product cannot be sold to this partner: ${bad_product_text}`
                        ),
                    });
                }
            }

            /**
             * Overloaded function.
             * @param {Orderline} line - The order line to be removed.
             */
            remove_orderline(line) {
                super.remove_orderline(line);
                if (line.product.membership) {
                    this._remove_non_allowed_orderlines();
                    this.select_orderline(this.get_last_orderline());
                }
            }

            /**
             * Overloaded function.
             * @param {partner} partner to set to the order. (can be undefined)
             */
            set_partner(partner) {
                super.set_partner(partner);
                this._remove_non_allowed_orderlines();
            }
        };
    Registries.Model.extend(Order, OverloadOrder);

    const OverloadOrderline = (OriginalOrderline) => {
        // Check if the original Orderline model already has
        // the set_delegated_member method. This is the case if the
        // pos_membership_delegated_partner module is installed.
        if (!("set_delegated_member" in OriginalOrderline.prototype)) {
            return OriginalOrderline;
        }

        // If the method exists, return a class that extends the original.
        return class extends OriginalOrderline {
            set_delegated_member(partner) {
                super.set_delegated_member(partner);
                this.order._remove_non_allowed_orderlines();
            }
        };
    };
    Registries.Model.extend(Orderline, OverloadOrderline);
});
