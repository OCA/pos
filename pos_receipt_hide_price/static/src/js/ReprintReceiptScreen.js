odoo.define("pos_receipt_hide_price.ReprintReceiptScreen", function (require) {
    "use strict";

    const {useState} = owl;
    const ReprintReceiptScreen = require("point_of_sale.ReprintReceiptScreen");
    const Registries = require("point_of_sale.Registries");

    const HidePriceReprintReceiptScreen = (OriginalReprintReceiptScreen) =>
        class extends OriginalReprintReceiptScreen {
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
    Registries.Component.extend(ReprintReceiptScreen, HidePriceReprintReceiptScreen);
    return ReprintReceiptScreen;
});
