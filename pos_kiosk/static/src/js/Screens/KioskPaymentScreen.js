odoo.define("pos_kiosk.KioskPaymentScreen", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class KioskPaymentScreen extends PosComponent {
        constructor() {
            super(...arguments);
            this.payment_methods = this.env.pos.payment_methods;
            this.order = this.env.pos.get_order();
        }

        backScreen() {
            this.order.remove_paymentline(this.order.paymentlines.models[0]);
            this.showScreen("KioskProductScreen");
        }

        countTotalItens() {
            let count = 0;
            for (const line of this.order.get_orderlines()) {
                count += line.get_quantity();
            }
            return count;
        }

        getTotalValue() {
            let count = 0;
            for (let i = 0; i < this.env.pos.get_order().orderlines.length; i++) {
                const element = this.env.pos.get_order().orderlines.models[i];
                count += element.get_price_with_tax();
            }
            return this.env.pos.format_currency(count);
        }

        openCartModal() {
            this.showPopup("CartModal", {
                order: this.env.pos.get_order(),
            });
        }

        addPaymentLine(payment_method) {
            if (this.order.paymentlines.length === 0) {
                this.order.add_paymentline(payment_method);
            } else {
                this.order.remove_paymentline(this.order.paymentlines.models[0]);
                this.order.add_paymentline(payment_method);
            }
            this.render();
        }

        hasPaymentline() {
            return this.order.paymentlines.length > 0;
        }

        async nextScreen() {
            if (this.order.paymentlines.length === 0) {
                this.showPopup("ErrorPopup", {
                    title: this.env._t("Payment Error"),
                    body: this.env._t("Please select a payment method"),
                });
                return;
            }

            this.showScreen("KioskClientScreen");
        }

        get methodPaymentLine() {
            if (!this.order.paymentlines.length === 0) {
                return false;
            }
            return this.order.paymentlines.models[0].payment_method.id;
        }
    }

    KioskPaymentScreen.template = "KioskPaymentScreen";

    Registries.Component.add(KioskPaymentScreen);

    return KioskPaymentScreen;
});
