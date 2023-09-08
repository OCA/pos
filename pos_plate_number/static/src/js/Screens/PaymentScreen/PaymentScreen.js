/*
@author: Felipe Zago <felipe.zago@kmee.com.br>
License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_plate_number.PaymentScreen", function (require) {
    "use strict";

    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");

    const PosPlateNumberPaymentScreen = (PaymentScreen_) =>
        class extends PaymentScreen_ {
            async validateOrder(isForceValidate) {
                if (!this.currentOrder.plate_number) {
                    if (this.env.pos.config.plate_number_generation === "manual") {
                        this.currentOrder.plate_number = await this.askPlateNumber();
                    } else {
                        this.currentOrder.plate_number = this.currentOrder.uid;
                    }
                }

                return super.validateOrder(isForceValidate);
            }

            get currentOrder() {
                return this.env.pos.get_order();
            }

            async askPlateNumber() {
                const {confirmed, payload} = await this.showPopup("NumberPopup", {
                    title: this.env._t("Plate Number"),
                });

                if (confirmed) {
                    return payload;
                }
            }
        };

    Registries.Component.extend(PaymentScreen, PosPlateNumberPaymentScreen);

    return PosPlateNumberPaymentScreen;
});
