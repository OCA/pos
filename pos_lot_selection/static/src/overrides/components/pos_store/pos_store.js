import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";

patch(PosStore.prototype, {
    addLineToOrder() {
        this.pos.selectedProduct = this;
        return super.addLineToOrder(...arguments);
    },
});