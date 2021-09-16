odoo.define("pos_receipt_hide_price.ReceiptScreen", function (require) {
    "use strict";

    const {useState} = owl.hooks;
    const ReceiptScreen = require("point_of_sale.ReceiptScreen");
    const Registries = require("point_of_sale.Registries");

    const HidePriceReceiptScreen = (ReceiptScreen) =>
        class extends ReceiptScreen {
            constructor() {
                super(...arguments);
                this.hpState = useState({priceHidden: false});
            }
            hidePrice() {
                this.hpState.priceHidden = !this.hpState.priceHidden;
            }
            get priceHidden() {
                return this.hpState.priceHidden;
            }
        };
    Registries.Component.extend(ReceiptScreen, HidePriceReceiptScreen);
    return ReceiptScreen;
});
