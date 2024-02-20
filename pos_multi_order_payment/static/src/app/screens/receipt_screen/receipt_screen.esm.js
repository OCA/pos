/** @odoo-module **/

import {ReceiptScreen} from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import {patch} from "@web/core/utils/patch";

patch(ReceiptScreen.prototype, {
    get printOtherOrders() {
        return (
            this.pos.orders.filter((order) => {
                return order.finalized && order.cid !== this.currentOrder.cid;
            }).length > 0
        );
    },
    isResumeVisible() {
        return super.isResumeVisible() && !this.printOtherOrders;
    },
    printNextOrder() {
        this.pos.removeOrder(this.currentOrder);
        this.pos.set_order(
            this.pos.orders.find((order) => {
                return order.finalized && order.cid !== this.currentOrder.cid;
            })
        );
        // As we are reusing the same view, we need to do this stuff...
        this.currentOrder = this.pos.get_order();
        const partner = this.currentOrder.get_partner();
        this.orderUiState = this.currentOrder.uiState.ReceiptScreen;
        this.orderUiState.inputEmail =
            this.orderUiState.inputEmail || (partner && partner.email) || "";
        this.pos.showScreen("ReceiptScreen");
    },
});
