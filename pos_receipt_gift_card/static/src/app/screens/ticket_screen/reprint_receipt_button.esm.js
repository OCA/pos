/** @odoo-module */

import {ReprintReceiptButton} from "@point_of_sale/app/screens/ticket_screen/reprint_receipt_button/reprint_receipt_button";
import {patch} from "@web/core/utils/patch";

patch(ReprintReceiptButton.prototype, {
    async _loadGiftCardData() {
        const order = this.props.order;
        if (order.giftCardData) return this.props.order.giftCardData;
        const domain = [
            ["source_pos_order_id", "=", order.server_id],
            ["program_type", "=", "gift_card"],
        ];
        order.get_gift_card_by_order(domain).then((data) => {
            order.giftCardData = data;
        });
    },

    async click() {
        if (!this.props.order) {
            return;
        }
        await this._loadGiftCardData();
        super.click();
    },
});
