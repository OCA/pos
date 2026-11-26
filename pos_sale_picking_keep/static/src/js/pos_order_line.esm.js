/* Copyright 2026 Jarsa - Jesús Alan Ramos Rodríguez
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";
import {patch} from "@web/core/utils/patch";

patch(PosOrderline.prototype, {
    /**
     * The PoS deducts the already delivered quantity when settling a sale
     * order, because it assumes it will deliver the remaining quantity
     * itself. With this module the sale order pickings are kept and the PoS
     * only charges the order, so the delivered quantity must not be
     * deducted. Only the already invoiced quantity is deducted to avoid
     * charging twice.
     * @override
     */
    async setQuantityFromSOL(saleOrderLine) {
        if (this.product_id.type === "service") {
            return super.setQuantityFromSOL(...arguments);
        }
        return this.setQuantity(
            saleOrderLine.product_uom_qty - saleOrderLine.qty_invoiced
        );
    },
});
