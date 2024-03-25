odoo.define("pos_membership_extension.models", function (require) {
    "use strict";

    const {Order, Product} = require("point_of_sale.models");

    var core = require("web.core");

    var {Gui} = require("point_of_sale.Gui");
    const Registries = require("point_of_sale.Registries");

    var _t = core._t;

    // eslint-disable-next-line no-shadow
    const OverloadProduct = (Product) =>
        // eslint-disable-next-line no-shadow
        class OverloadProduct extends Product {
            /**
             * Return if it's allowed to sell the product to the partner.
             *
             * @param {partner} partner to test. (can be undefined)
             * @returns {Boolean} True if the sell is allowed, false otherwise.
             */
            get_membership_allowed(partner) {
                // No categories means no restriction
                if (this.allowed_membership_category_ids.length === 0) {
                    return true;
                }
                // If categories are set, but no partner, sell is forbidden in any case
                if (!partner) {
                    return false;
                }
                var common_categories = this.allowed_membership_category_ids.filter(
                    function (categ) {
                        return partner.membership_category_ids.indexOf(categ) !== -1;
                    }
                );
                return common_categories.length !== 0;
            }
        };
    Registries.Model.extend(Product, OverloadProduct);

    // eslint-disable-next-line no-shadow
    const OverloadOrder = (Order) =>
        // eslint-disable-next-line no-shadow
        class OverloadOrder extends Order {
            /**
             * Overloaded function.
             * Check if the product of the order lines are allowed by the
             * new selected partner.
             * If not, remove according lines and raise a PopUp Error to
             * inform the cashier of the removal.
             * @param {partner} partner to set to the order. (can be undefined)
             * @returns {Boolean} In any case, return the result of the super function.
             */
            set_partner(partner) {
                var self = this;
                var bad_product_list = [];
                this.orderlines.forEach(function (orderline) {
                    if (!orderline.product.get_membership_allowed(partner)) {
                        bad_product_list.push(orderline.product.display_name);
                        self.orderlines.remove(orderline);
                    }
                });
                if (bad_product_list.length !== 0) {
                    var bad_product_text = bad_product_list.join(", ");
                    Gui.showPopup("ErrorPopup", {
                        title: _t("Order Line Removal"),
                        body: _t(
                            `The following lines has been removed, as the product cannot be sold to this partner: ${bad_product_text}`
                        ),
                    });
                    return;
                }

                return super.set_partner(...arguments);
            }
        };

    Registries.Model.extend(Order, OverloadOrder);
});
