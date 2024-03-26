odoo.define("pos_receipt_replace_user_by_trigram.OrderReceipt", function (require) {
    "use strict";

    const OrderReceipt = require("point_of_sale.OrderReceipt");
    const Registries = require("point_of_sale.Registries");

    const ReplaceUserByTrigramOrderReceipt = (OriginalOrderReceipt) =>
        class extends OriginalOrderReceipt {
            constructor() {
                super(...arguments);
                this.replace_user_by_trigram =
                    this.env.pos.config.replace_user_by_trigram;
            }

            get is_replace_user_by_trigram() {
                return this.replace_user_by_trigram;
            }
        };
    Registries.Component.extend(OrderReceipt, ReplaceUserByTrigramOrderReceipt);
    return OrderReceipt;
});
