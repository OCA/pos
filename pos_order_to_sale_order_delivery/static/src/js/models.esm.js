/** @odoo-module **/

import {Order} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const PosOrderToSaleOrderDeliveryOrder = (Order) =>
    class PosOrderToSaleOrderDeliveryOrder extends Order {
        constructor() {
            super(...arguments);
            this.delivery_carrier = false;
        }
        get_delivery_carrier() {
            return this.delivery_carrier;
        }
        set_delivery_carrier(delivery_carrier) {
            this.delivery_carrier = delivery_carrier;
        }
        export_as_JSON() {
            const result = super.export_as_JSON(...arguments);
            result.delivery_carrier = this.get_delivery_carrier();
            return result;
        }
        init_from_JSON(json) {
            super.init_from_JSON(...arguments);
            this.set_delivery_carrier(json.delivery_carrier || false);
        }
    };

Registries.Model.extend(Order, PosOrderToSaleOrderDeliveryOrder);

export default PosOrderToSaleOrderDeliveryOrder;
