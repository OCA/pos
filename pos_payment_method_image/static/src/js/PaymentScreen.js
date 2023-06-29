/*
License LGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_payment_method_image.PaymentScreen", function (require) {
    "use strict";

    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");

    const OverloadPaymentScreen = (PaymentScreen) =>
        class OverloadPaymentScreen extends PaymentScreen {
            paymentMethodImage(id) {
                if (this.paymentMethod.image)
                    return `/web/image/pos.payment.method/${id}/image`;
                else if (this.paymentMethod.type === "cash")
                    return "/pos_payment_method_image/static/src/img/money.png";
                else if (this.paymentMethod.type === "pay_later")
                    return "/pos_payment_method_image/static/src/img/pay-later.png";
                return "/pos_payment_method_image/static/src/img/card-bank.png";
            }
        };

    Registries.Component.extend(PaymentScreen, OverloadPaymentScreen);

    return PaymentScreen;
});
