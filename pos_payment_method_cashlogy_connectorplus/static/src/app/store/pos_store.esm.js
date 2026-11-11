import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    _get_cashlogy_payment_methods() {
        return this.config.payment_method_ids.filter(
            (m) => m.use_payment_terminal === "cashlogy"
        );
    },
    hasCashlogyPaymentMethod() {
        return Object.keys(this._get_cashlogy_payment_methods()).length;
    },
});
