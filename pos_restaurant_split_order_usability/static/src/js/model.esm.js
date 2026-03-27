/** @odoo-module **/

import {Model} from "point_of_sale.Registries";
import {Order} from "point_of_sale.models";

const SplitOrder = (Order_) =>
    class extends Order_ {
        // @override
        export_as_JSON() {
            const json = super.export_as_JSON();
            json.origin_order_uid = this.getCurrentOrderUid();
            return json;
        }

        // Custom Section
        getCurrentOrderUid() {
            return this.origin_order_uid;
        }
    };

Model.extend(Order, SplitOrder);
