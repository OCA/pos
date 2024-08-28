odoo.define("pos_payment_restriction.PaymentScreen", function (require) {
    "use strict";

    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");

    const PosPaymentScreen = (OriginalPaymentScreen) =>
        class extends OriginalPaymentScreen {
            _updateSelectedPaymentline() {
                if (this.env.pos.payment_amount_readonly) {
                    return;
                }
                return super._updateSelectedPaymentline();
            }
        };

    Registries.Component.extend(PaymentScreen, PosPaymentScreen);

    return PosPaymentScreen;
});
