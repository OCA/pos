odoo.define("pos_kiosk.KioskCartFooter", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class KioskCartFooter extends PosComponent {
        getTotalItems() {
            const orderlines = this.env.pos.get_order().orderlines;
            const count = orderlines.reduce(
                (total, orderline) => total + orderline.quantity,
                0
            );
            return count;
        }

        getTotalValue() {
            const orderlines = this.env.pos.get_order().orderlines;
            const totalValue = orderlines.reduce(
                (total, orderline) => total + orderline.get_price_with_tax(),
                0
            );
            return this.env.pos.format_currency(totalValue);
        }

        haveProduct() {
            return true ? this.env.pos.get_order().orderlines.length > 0 : false;
        }

        openCart() {
            this.env.pos.get_order().screen_data = {current: "KioskProductScreen"};
            this.showPopup("CartModal", {
                order: this.env.pos.get_order(),
            });
        }

        openPaymentScreen() {
            if (this.haveProduct()) {
                this.env.pos.get_order().screen_data = {current: "KioskPaymentScreen"};
                this.showScreen("KioskPaymentScreen");
            }
        }
    }

    KioskCartFooter.template = "KioskCartFooter";

    Registries.Component.add(KioskCartFooter);

    return KioskCartFooter;
});
