odoo.define("pos_receipt_hide_price.ReprintReceiptScreen", function (require) {
    "use strict";

    const {useState} = owl.hooks;
    const ReprintReceiptScreen = require("point_of_sale.ReprintReceiptScreen");
    const Registries = require("point_of_sale.Registries");

    const HidePriceReprintReceiptScreen = (ReprintReceiptScreen) =>
        class extends ReprintReceiptScreen {
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
    Registries.Component.extend(ReprintReceiptScreen, HidePriceReprintReceiptScreen);
    return ReprintReceiptScreen;
});
