/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
import {PaymentInterface} from "@point_of_sale/app/payment/payment_interface";
import {_t} from "@web/core/l10n/translation";
import {register_payment_method} from "@point_of_sale/app/store/pos_store";

/**
 * Credit Payment Interface
 * Handles credit payment as a payment terminal
 */
export class PaymentCredit extends PaymentInterface {
    get fast_payments() {
        return false;
    }

    /**
     * Setup the payment interface
     */
    setup() {
        super.setup(...arguments);
    }

    /**
     * Send payment request to the credit payment controller
     * @param {String} uuid - Unique payment identifier
     * @returns {Promise<Boolean>} - Success status
     */
    async send_payment_request(uuid) {
        await super.send_payment_request(uuid);

        const order = this.pos.get_order();
        const line = order?.payment_ids?.find(
            (paymentLine) => paymentLine.uuid === uuid
        );
        if (!line) {
            return false;
        }

        const partner = order.get_partner();

        if (!partner) {
            line.set_payment_status("retry");
            return false;
        }

        try {
            const result = await this.pos.processCreditPayment(line);

            if (result.status === "success") {
                line.set_payment_status("done");
                line.can_be_reversed = true;
                line.transaction_id = result.transaction_id;
                return true;
            }
            line.set_payment_status("retry");
            line.error_message = result.error;
            return false;
        } catch (error) {
            line.set_payment_status("retry");
            line.error_message = error.message || _t("Payment processing failed");
            return false;
        }
    }

    /**
     * Send payment cancel request
     * @param {Object} order - POS order
     * @param {String} uuid - Payment UUID
     * @returns {Promise<Boolean>} - Success status
     */
    async send_payment_cancel(order, uuid) {
        await super.send_payment_cancel(order, uuid);

        const line = this.pos.getPendingPaymentLine(uuid);
        if (line) {
            line.set_payment_status("retry");
        }
        return true;
    }

    /**
     * Send payment reversal (refund) request
     * @param {String} uuid - Payment UUID
     * @returns {Promise<Boolean>} - Success status
     */
    async send_payment_reversal(uuid) {
        await super.send_payment_reversal(uuid);

        const order = this.pos.get_order();
        const line = order?.payment_ids?.find(
            (paymentLine) => paymentLine.uuid === uuid
        );
        if (!line) {
            return false;
        }

        const partner = order.get_partner();

        if (!partner) {
            return false;
        }

        try {
            // Create a reversed payment line for processing
            const reversalLine = {
                amount: -Math.abs(line.amount),
                payment_method_id: line.payment_method_id,
            };

            const result = await this.pos.processCreditPayment(reversalLine);

            if (result.status === "success") {
                line.set_payment_status("reversed");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error processing credit payment reversal:", error);
            return false;
        }
    }

    /**
     * Close the payment interface
     */
    close() {
        super.close(...arguments);
    }
}

register_payment_method("credit", PaymentCredit);
