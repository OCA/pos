/** @odoo-module **/

import TicketScreen from "point_of_sale.TicketScreen";
import {patch} from "@web/core/utils/patch";

patch(TicketScreen.prototype, "pos_full_refund.TicketScreen", {
    onDoFullRefund() {
        const order = this.getSelectedSyncedOrder();
        if (!order) {
            return;
        }

        // Set all orderlines to be fully refunded
        // In Odoo 16, we use env.pos.toRefundLines instead of order.uiState.lineToRefund
        for (const line of order.get_orderlines()) {
            const refundableQty = line.get_quantity() - line.refunded_qty;
            if (refundableQty > 0) {
                // Get or create refund detail for this orderline
                const toRefundDetail = this._getToRefundDetail(line);
                toRefundDetail.qty = refundableQty;
            }
        }

        // Trigger the refund process
        this._onDoRefund();
    },
});
