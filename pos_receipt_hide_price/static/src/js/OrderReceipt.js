odoo.define("pos_receipt_hide_price.OrderReceipt", function (require) {
    "use strict";

    const OrderReceipt = require("point_of_sale.OrderReceipt");
    const Registries = require("point_of_sale.Registries");

    const HidePriceOrderReceipt = (OrderReceipt) =>
        class extends OrderReceipt {
            constructor(_, {hidePriceState}) {
                super(...arguments);
                this.hidePriceState = hidePriceState;
            }
            get priceHidden() {
                return this.hidePriceState.priceHidden;
            }
        };
    Registries.Component.extend(OrderReceipt, HidePriceOrderReceipt);
    return OrderReceipt;
});
