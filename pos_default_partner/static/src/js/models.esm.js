import {PosOrder} from "@point_of_sale/app/models/pos_order";
import {patch} from "@web/core/utils/patch";

patch(PosOrder.prototype, {
    setup() {
        super.setup(...arguments);
        const default_partner_id = this.config_id.default_partner_id;
        if ((!this.finalized || !this.partner_id) && default_partner_id) {
            this.set_partner(default_partner_id);
        }
    },
});
