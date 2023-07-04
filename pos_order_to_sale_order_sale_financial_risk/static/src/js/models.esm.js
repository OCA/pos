/** @odoo-module **/

import {Order} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const PosSaleFinancialRiskOrder = (Order) =>
    class PosSaleFinancialRiskOrder extends Order {
        constructor() {
            super(...arguments);
            this.bypass_risk = false;
        }
        set_bypass_risk(bypass_risk) {
            this.bypass_risk = bypass_risk;
        }
        export_as_JSON() {
            const result = super.export_as_JSON(...arguments);
            result.bypass_risk = this.bypass_risk;
            return result;
        }
        init_from_JSON(json) {
            super.init_from_JSON(...arguments);
            this.bypass_risk = json.bypass_risk;
        }
    };

Registries.Model.extend(Order, PosSaleFinancialRiskOrder);

export default PosSaleFinancialRiskOrder;
