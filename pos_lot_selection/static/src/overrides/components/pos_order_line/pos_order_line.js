import { PosOrderline } from "@point_of_sale/app/models/pos_order_line";
import { patch } from "@web/core/utils/patch";

patch(PosOrderline.prototype, {
    editPackLotLines() {
        this.pos.selectedProduct = this.product;
        return super.editPackLotLines(...arguments);
    },
});