import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async processServerData() {
        await super.processServerData(...arguments);
        this.config.paper_meal_voucher_payment_method = null;
        for (const payment_method of this.config.payment_method_ids) {
            if (payment_method.meal_voucher_type === "paper") {
                this.config.paper_meal_voucher_payment_method = payment_method;
                break;
            }
        }
    },
});
