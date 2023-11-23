/** @odoo-module **/
// Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import PaymentScreen from "point_of_sale.PaymentScreen";
import Registries from "point_of_sale.Registries";

export const OverloadPaymentScreen = (OriginalPaymentScreen) =>
    class extends OriginalPaymentScreen {
        async _finalizeValidation() {
            // Skip if there is no change
            if (this.currentOrder.get_change() > 0.0) {
                var paymentMethod =
                    this.currentOrder.get_payment_method_of_change_policy();

                // Skip if there is no payment line
                if (paymentMethod) {
                    if (paymentMethod.change_policy === "profit_product") {
                        console.log(paymentMethod.change_product_id);
                        var profit_product = this.env.pos.db.get_product_by_id(
                            paymentMethod.change_product_id[0]
                        );

                        // Raise an error if the configured product is not available
                        // in the Point of sale.
                        if (!profit_product) {
                            this.showPopup("ErrorPopup", {
                                title: this.env._t("Error: Unavailable Product."),
                                body:
                                    this.env._t(
                                        "Please make the following product\navailable in the point of sale : \n\n"
                                    ) +
                                    paymentMethod.change_product_id[1] +
                                    this.env._t("\nThen, reload your Point of Sale."),
                            });
                            return;
                        }
                        this.currentOrder.add_product(profit_product, {
                            quantity: 1,
                            price: this.currentOrder.get_change(),
                            lst_price: this.currentOrder.get_change(),
                            extras: {price_automatically_set: true},
                        });
                    }
                }
            }
            return super._finalizeValidation(...arguments);
        }
    };

Registries.Component.extend(PaymentScreen, OverloadPaymentScreen);
