/* Copyright 2023 Aures Tic - Jose Zambudio
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_return_voucher.ReturnVoucherScreen", function (require) {
    "use strict";

    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");

    const ReturnVoucherScreen = (PaymentScreen) =>
        class extends PaymentScreen {
            async addNewPaymentLine({detail: paymentMethod}) {
                const prevPaymentLines = this.currentOrder.paymentlines.clone();
                let res = false;
                if (paymentMethod.return_voucher && this.currentOrder.get_due() > 0) {
                    const {id, amount} = await this.showPopup("SetReturnVoucherPopup", {
                        title: this.env._t("Set return voucher"),
                        pos: this.env.pos,
                    });
                    if (id && amount > 0) {
                        res = super.addNewPaymentLine(...arguments);
                        const newPaymentline = this.currentOrder.paymentlines.filter(
                            (item) => {
                                return !prevPaymentLines.find(item);
                            }
                        );
                        if (res && newPaymentline.length === 1) {
                            newPaymentline[0].set_redeemed_return_voucher(id);
                            if (amount < newPaymentline[0].amount) {
                                newPaymentline[0].set_amount(amount);
                            }
                        }
                    }
                } else {
                    res = super.addNewPaymentLine(...arguments);
                }
                return res;
            }
        };

    Registries.Component.extend(PaymentScreen, ReturnVoucherScreen);

    return PaymentScreen;
});
