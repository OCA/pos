import {PosPayment} from "@point_of_sale/app/models/pos_payment";
import {patch} from "@web/core/utils/patch";

patch(PosPayment.prototype, {
    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        return {
            ...result,
            hide_payment_info_in_receipt: this.hide_payment_info_in_receipt,
        };
    },
});
