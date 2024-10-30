odoo.define("pos_auto_invoice.models", function (require) {
    "use strict";

    const {Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const AutoInvoiceOrder = (OriginalOrder) =>
        class extends OriginalOrder {
            constructor() {
                super(...arguments);
                if (this.pos.config.invoice_by_default) {
                    this.to_invoice = true;
                }
            }
        };

    Registries.Model.extend(Order, AutoInvoiceOrder);
});
