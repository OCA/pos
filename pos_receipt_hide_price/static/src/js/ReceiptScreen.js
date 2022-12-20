odoo.define("pos_receipt_hide_price.ReceiptScreen", function (require) {
    "use strict";

    const {useState} = owl;
    const ReceiptScreen = require("point_of_sale.ReceiptScreen");
    const Registries = require("point_of_sale.Registries");

    const HidePriceReceiptScreen = (OriginalReceiptScreen) =>
        class extends OriginalReceiptScreen {
            constructor() {
                super(...arguments);
                this.hidePriceState = useState({priceHidden: false});
            }
            hidePrice() {
                this.hidePriceState.priceHidden = !this.hidePriceState.priceHidden;
            }
            get priceHidden() {
                return this.hidePriceState.priceHidden;
            }
        };
    Registries.Component.extend(ReceiptScreen, HidePriceReceiptScreen);
    return ReceiptScreen;
});
