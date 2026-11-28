import {TicketScreen} from "@point_of_sale/app/screens/ticket_screen/ticket_screen";
import {patch} from "@web/core/utils/patch";

patch(TicketScreen.prototype, {
    async onDoFullRefund() {
        const order = this.getSelectedOrder();
        if (!order) {
            return;
        }

        // Set all orderlines to be fully refunded
        for (const line of order.lines) {
            if (line.combo_parent_id) {
                continue;
            }
            const toRefundDetail = this.getToRefundDetail(line);
            if (!toRefundDetail.destinationOrder && toRefundDetail.refundableQty > 0) {
                toRefundDetail.qty = toRefundDetail.refundableQty;

                // Handle combo lines
                if (line.combo_line_ids?.length) {
                    for (const comboLine of line.combo_line_ids) {
                        const comboRefundDetail = this.getToRefundDetail(comboLine);
                        if (!comboRefundDetail.destinationOrder) {
                            comboRefundDetail.qty =
                                (comboLine.qty / line.qty) * toRefundDetail.qty;
                        }
                    }
                }
            }
        }

        // Trigger the refund process
        await this.onDoRefund();
    },
});
