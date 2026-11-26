/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {PosStore} from "@point_of_sale/app/store/pos_store";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    /**
     * Override to add credit payment methods support
     */
    async setup() {
        await super.setup(...arguments);
        this.paymentCreditInProgress = false;
        this.paymentCreditText = "";
    },

    /**
     * Process credit payment through controller
     * @param {Object} payment - Payment object
     * @returns {Promise<Object>} - Payment result
     */
    async processCreditPayment(payment) {
        const order = this.get_order();
        const partner = order.get_partner();

        if (!partner) {
            return {
                status: "error",
                error: _t("No customer selected for credit payment"),
            };
        }

        const amount = Math.abs(payment.amount);
        const isRefund = payment.amount < 0;

        this.paymentCreditInProgress = true;
        this.paymentCreditText = isRefund
            ? _t("Processing refund to credit...")
            : _t("Processing payment with credit...");

        try {
            const methodName = isRefund
                ? "pos_payment_credit_refund"
                : "pos_payment_credit_payment";

            const result = await this.data.call("pos.payment.method", methodName, [
                partner.id,
                amount,
                order.uid,
            ]);

            if (result.status === "success") {
                // Update partner's credit amount in the local cache
                partner.credit_amount = isRefund
                    ? result.new_credit_balance
                    : result.remaining_credit;

                payment.transaction_id = result.transaction_id;
                payment.set_payment_status(isRefund ? "reversed" : "done");

                this.paymentCreditText = isRefund
                    ? _t(
                          "Refund processed. New balance: %s",
                          this.env.utils.formatCurrency(partner.credit_amount)
                      )
                    : _t(
                          "Payment successful. Remaining credit: %s",
                          this.env.utils.formatCurrency(partner.credit_amount)
                      );

                // Clear message after 3 seconds

                setTimeout(() => {
                    this.paymentCreditInProgress = false;
                    this.paymentCreditText = "";
                }, 3000);

                return result;
            }
            this.paymentCreditInProgress = false;
            this.paymentCreditText = "";
            return result;
        } catch (error) {
            this.paymentCreditInProgress = false;
            this.paymentCreditText = "";
            return {
                status: "error",
                error: error.message || _t("Payment processing failed"),
            };
        }
    },

    /**
     * Get current credit balance for a partner
     * @param {Number} partnerId - Partner ID
     * @returns {Promise<Object>} - Balance result
     */
    async getCreditBalance(partnerId) {
        try {
            const result = await this.data.call(
                "pos.payment.method",
                "pos_payment_credit_get_balance",
                [partnerId]
            );
            return result;
        } catch (error) {
            return {
                status: "error",
                error: error.message || _t("Failed to get balance"),
            };
        }
    },
});
