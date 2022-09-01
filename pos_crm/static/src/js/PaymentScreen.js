/*
Copyright (C) 2022-Today KMEE (https://kmee.com.br)
 License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*/

odoo.define("pos_crm.PaymentScreen", function (require) {
    "use strict";

    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");

    const PosAskCustomerPaymentScreen = (PaymentScreen) =>
        class extends PaymentScreen {
            async validateOrder(isForceValidate) {
                var order = this.env.pos.get_order();
                await order.ask_customer_data(this, "payment");
                return super.validateOrder(isForceValidate);
            }
        };

    Registries.Component.extend(PaymentScreen, PosAskCustomerPaymentScreen);

    return PosAskCustomerPaymentScreen;
});
