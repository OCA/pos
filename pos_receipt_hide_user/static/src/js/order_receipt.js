odoo.define("pos_receipt_hide_user.OrderReceipt", function (require) {
    "use strict";

    const OrderReceipt = require("point_of_sale.OrderReceipt");
    const Registries = require("point_of_sale.Registries");

    const HideUserOrderReceipt = (OriginalOrderReceipt) =>
        class extends OriginalOrderReceipt {
            constructor() {
                super(...arguments);
                this.hide_user_from_config = this.env.pos.config.hide_user;
            }

            get hideUser() {
                return this.hide_user_from_config;
            }
        };
    Registries.Component.extend(OrderReceipt, HideUserOrderReceipt);
    return OrderReceipt;
});
