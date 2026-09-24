import {PosPayment} from "@point_of_sale/app/models/pos_payment";
import {patch} from "@web/core/utils/patch";

patch(PosPayment.prototype, {
    get_iface_automatic_cashdrawer() {
        return this.payment_method_id.iface_automatic_cashdrawer || false;
    },
});
