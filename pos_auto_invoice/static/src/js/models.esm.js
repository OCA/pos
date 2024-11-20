/** @odoo-module **/

import {Order} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const AutoInvoiceOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        constructor(obj, options) {
            super(...arguments);
            if (!options.json && this.pos.config.invoice_by_default) {
                this.to_invoice = true;
            }
        }

        init_from_JSON(json) {
            super.init_from_JSON(...arguments);
            // This should be done in the original method, but curiously
            // it is not (to_invoice is always set to false).
            this.to_invoice = json.to_invoice;
        }
    };

Registries.Model.extend(Order, AutoInvoiceOrder);
