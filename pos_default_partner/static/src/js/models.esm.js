/** @odoo-module **/

import {Order} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const DefaultPartnerOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        constructor(obj, options) {
            super(...arguments);
            const default_partner_id = this.pos.config.default_partner_id;
            if (!options.json && default_partner_id) {
                this.set_partner(this.pos.db.get_partner_by_id(default_partner_id[0]));
            }
        }
    };

Registries.Model.extend(Order, DefaultPartnerOrder);
