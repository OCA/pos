odoo.define("pos_kiosk.KioskReceiptScreen", function (require) {
    "use strict";

    const {useRef} = owl.hooks;
    const {useErrorHandlers, onChangeOrder} = require("point_of_sale.custom_hooks");
    const Registries = require("point_of_sale.Registries");
    const AbstractReceiptScreen = require("point_of_sale.AbstractReceiptScreen");

    const KioskReceiptScreen = (AbstractReceiptScreen) => {
        class KioskReceiptScreen extends AbstractReceiptScreen {
            constructor() {
                super(...arguments);
                useErrorHandlers();
                onChangeOrder(null, (newOrder) => newOrder && this.render());
                this.orderReceipt = useRef("order-receipt");
            }

            mounted() {
                setTimeout(async () => await this.handleAutoPrint(), 0);
            }

            get currentOrder() {
                return this.env.pos.get_order();
            }

            async handleAutoPrint() {
                if (this._shouldAutoPrint()) {
                    await this.printReceipt();
                }
            }

            _shouldAutoPrint() {
                return (
                    this.env.pos.config.iface_print_auto && !this.currentOrder._printed
                );
            }

            async printReceipt() {
                const currentOrder = this.currentOrder;
                const isPrinted = await this._printReceipt();
                if (isPrinted) {
                    currentOrder._printed = true;
                }
            }

            makeOtherOrder() {
                this.env.pos.get_order().destroy();
                this.env.pos.set("selectedCategoryId", false);
                this.showScreen("KioskProductScreen");
            }

            endedSession() {
                this.env.pos.get_order().destroy();
                this.env.pos.set("selectedCategoryId", false);
                this.showScreen("WelcomeScreen");
            }
        }

        KioskReceiptScreen.template = "KioskReceiptScreen";

        return KioskReceiptScreen;
    };

    Registries.Component.addByExtending(KioskReceiptScreen, AbstractReceiptScreen);

    return KioskReceiptScreen;
});
