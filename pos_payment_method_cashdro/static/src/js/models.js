/* Copyright 2021-22 Tecnativa - David Vidal
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).*/
odoo.define("pos_payment_method_cashdro.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const PaymentCashdro = require("pos_payment_method_cashdro.payment");

    models.register_payment_method("cashdro", PaymentCashdro);
    models.load_fields("pos.payment.method", [
        "cashdro_host",
        "cashdro_user",
        "cashdro_password",
    ]);

    const order_super = models.Order.prototype;

    models.Order = models.Order.extend({
        initialize: function () {
            order_super.initialize.apply(this, arguments);
            this.in_cashdro_transaction = false;
        },
        add_paymentline: function () {
            const line = order_super.add_paymentline.apply(this, arguments);
            if (!line) {
                return line;
            }
            if (
                line.payment_method &&
                line.payment_method.use_payment_terminal === "cashdro"
            ) {
                line.set_amount(0);
            }
            return line;
        },
    });
});
