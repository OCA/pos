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
            this.showScreen("MainScreen");
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

        nextScreen() {
            this.showScreen("KioskClientScreen");
        }

        get topBannerLogo() {
            const pos_config = this.env.pos.config;
            return `/web/image?model=pos.config&field=top_banner_image&id=${pos_config.id}&write_date=${pos_config.write_date}&unique=1`;
        }
    }

    KioskPaymentScreen.template = "KioskPaymentScreen";

    Registries.Component.add(KioskPaymentScreen);

    return KioskPaymentScreen;
});
