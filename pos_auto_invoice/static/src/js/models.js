odoo.define("pos_auto_invoice.models", function (require) {
    "use strict";

    const {Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    // eslint-disable-next-line no-shadow
    const AutoInvoiceOrder = (Order) =>
        // eslint-disable-next-line no-shadow
        class AutoInvoiceOrder extends Order {
            constructor() {
                super(...arguments);
                this.to_invoice = true;
            }
        };

    Registries.Model.extend(Order, AutoInvoiceOrder);
});
