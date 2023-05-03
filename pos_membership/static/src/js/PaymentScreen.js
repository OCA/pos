odoo.define("pos_membership.PaymentScreen", function (require) {
    "use strict";

    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");

    // eslint-disable-next-line no-shadow
    const OverloadPaymentScreen = (PaymentScreen) =>
        // eslint-disable-next-line no-shadow
        class OverloadPaymentScreen extends PaymentScreen {
            async _isOrderValid() {
                var has_membership_products = false;
                this.currentOrder.get_orderlines().forEach(function (order_line) {
                    if (order_line.product.membership) {
                        has_membership_products = true;
                    }
                });
                if (has_membership_products && !this.currentOrder.is_to_invoice()) {
                    this.showPopup("ErrorPopup", {
                        title: this.env._t("Invoice Required"),
                        body: this.env._t(
                            "You should create an invoice if you sell membership products."
                        ),
                    });
                    return false;
                }

                return await super._isOrderValid(...arguments);
            }
        };

    Registries.Component.extend(PaymentScreen, OverloadPaymentScreen);

    return PaymentScreen;
});
