import {PosOrder} from "@point_of_sale/app/models/pos_order";
import {patch} from "@web/core/utils/patch";

patch(PosOrder.prototype, {
    canBeValidated() {
        const flag = super.canBeValidated();
        if (!flag) {
            return flag;
        }
        const allAuto = this.isAllAutoValidationPayments();
        return !allAuto;
    },
    canBeBack() {
        const allAuto = this.isAllAutoValidationPayments();
        return !allAuto;
    },
    isAllAutoValidationPayments() {
        return (
            this.payment_ids?.length > 0 &&
            this.payment_ids.every(
                (p) =>
                    p.payment_method_id?.is_automatic_validation === true &&
                    !p.payment_method_id?.use_payment_terminal
            )
        );
    },
});
