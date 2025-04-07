/** @odoo-module **/

import {Order} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const PosOrderToSaleOrderCommitmentDate = (OriginalOrder) =>
    class extends OriginalOrder {
        constructor() {
            super(...arguments);
            this.commitment_date = false;
        }
        get_commitment_date() {
            return this.commitment_date;
        }
        set_commitment_date(commitment_date) {
            this.commitment_date = new Date(commitment_date).toISOString();
        }
        export_as_JSON() {
            const result = super.export_as_JSON(...arguments);
            result.commitment_date = this.get_commitment_date();
            return result;
        }
        init_from_JSON(json) {
            super.init_from_JSON(...arguments);
            this.set_commitment_date(json.commitment_date || false);
        }
    };

Registries.Model.extend(Order, PosOrderToSaleOrderCommitmentDate);

export default PosOrderToSaleOrderCommitmentDate;
