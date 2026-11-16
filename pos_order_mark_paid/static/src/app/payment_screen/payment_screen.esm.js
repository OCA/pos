/** @odoo-module */
/* Copyright 2026 Cetmix OÜ
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    /**
     * Mark the order as paid, or unmark it when it is marked.
     */
    toggleMarkPaid() {
        // Apply a pending numpad input first, as validateOrder() does.
        this.numberBuffer.capture();
        const order = this.currentOrder;
        if (order.isMarkedPaid()) {
            order.clearMarkPaid();
            return;
        }
        const error = order.getMarkPaidError();
        if (error) {
            this.popup.add(ErrorPopup, {title: _t("Mark as Paid"), body: error});
            return;
        }
        order.markPaid();
    },
    validateOrder() {
        // Before _isOrderValid(): core then removes the pending payment lines
        // and finalizes without checking the order again.
        this.currentOrder.clearStaleMarkPaid();
        return super.validateOrder(...arguments);
    },
});
