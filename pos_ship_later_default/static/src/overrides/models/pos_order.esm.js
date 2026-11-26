import {PosOrder} from "@point_of_sale/app/models/pos_order";
import {patch} from "@web/core/utils/patch";

const {DateTime} = luxon;

patch(PosOrder.prototype, {
    setup() {
        super.setup(...arguments);
        if (this.config.ship_later_default && !this.shipping_date) {
            const delay = this.config.ship_later_delivery_delay || 0;
            const shippingDate = DateTime.now().plus({days: delay});
            this.setShippingDate(shippingDate);
        }
    },
});
