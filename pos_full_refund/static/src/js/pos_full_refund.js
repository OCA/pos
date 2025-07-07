import {TicketScreen} from "@point_of_sale/app/screens/ticket_screen/ticket_screen";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(TicketScreen.prototype, {
    onDoFullRefund() {
        const order = this.getSelectedOrder();
        if (!order) {
            return;
        }

        // Initialize lineToRefund if it doesn't exist
        if (!order.uiState.lineToRefund) {
            order.uiState.lineToRefund = {};
        }

        // Set all orderlines to be fully refunded
        for (const line of order.lines) {
            const refundableQty = line.get_quantity() - line.refunded_qty;
            if (refundableQty > 0) {
                // Set the refund quantity in the UI state
                order.uiState.lineToRefund[line.uuid] = {
                    qty: refundableQty,
                    line: line,
                };

                // Handle combo lines
                if (line.combo_line_ids && line.combo_line_ids.length > 0) {
                    for (const comboLine of line.combo_line_ids) {
                        const comboRefundableQty =
                            comboLine.get_quantity() - comboLine.refunded_qty;
                        if (comboRefundableQty > 0) {
                            order.uiState.lineToRefund[comboLine.uuid] = {
                                qty: comboRefundableQty,
                                line: comboLine,
                            };
                        }
                    }
                }
            }
        }

        // Trigger the refund process
        this.onDoRefund();
    },
});
