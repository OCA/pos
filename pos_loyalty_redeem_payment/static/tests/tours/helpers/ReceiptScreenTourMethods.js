odoo.define(
    "pos_loyalty_redeem_payment.tour.ReceiptScreenTourMethods",
    function (require) {
        "use strict";
        const {createTourMethods} = require("point_of_sale.tour.utils");
        const {
            Do,
            Check,
            Execute,
        } = require("point_of_sale.tour.ReceiptScreenTourMethods");

        class CheckExt extends Check {
            couponCodeIsShown(code) {
                return [
                    {
                        content: `coupon code is '${code}'`,
                        trigger: `.receipt-screen span.payment-code:contains("${code}")`,
                    },
                ];
            }
        }

        return createTourMethods("ReceiptScreen", Do, CheckExt, Execute);
    }
);
