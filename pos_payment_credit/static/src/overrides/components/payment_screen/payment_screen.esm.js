/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {_t} from "@web/core/l10n/translation";
import {ask} from "@point_of_sale/app/store/make_awaitable_dialog";
import {floatIsZero} from "@web/core/utils/numbers";
import {onMounted} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup(...arguments);
        // Auto-apply credit on initial payment screen load
        this.autoApplyCreditPayment();
        onMounted(() => this._processAutoCreditLines());
    },
    async _processAutoCreditLines() {
        const order = this.currentOrder;
        const lines = (order.payment_ids || []).filter(
            (line) =>
                line.payment_method_id?.use_payment_terminal === "credit" &&
                line.payment_method_id?.auto_apply_credit_amount &&
                line.payment_method_id?.auto_apply_credit_amount_mode === "auto" &&
                !line.is_done()
        );
        for (const line of lines) {
            await this.processAutoCreditPaymentLine(line);
        }
        if (lines.length > 0) {
            // Payment succeeded - paymentLine is already marked as done in processCreditPayment
            if (order.is_paid() && this.pos.config.auto_validate_terminal_payment) {
                if (this._creditAutoValidateInProgress) {
                    return;
                }
                this._creditAutoValidateInProgress = true;
                try {
                    await this.validateOrder(true);
                } finally {
                    this._creditAutoValidateInProgress = false;
                }
            }
        }
    },
    /**
     * Override to handle credit payment method as a payment terminal
     */
    async addNewPaymentLine(paymentMethod) {
        const result = await super.addNewPaymentLine(...arguments);

        // If this is a credit payment method, process it as a terminal
        if (result && paymentMethod.use_payment_terminal === "credit") {
            const order = this.currentOrder;
            const partner = order.partner_id;

            if (!partner) {
                const confirmed = await ask(this.dialog, {
                    title: _t("Customer Required"),
                    body: _t("Please select a customer to use credit payment."),
                });
                if (!confirmed) {
                    return false;
                }
                this.pos.selectPartner();
            }

            // Get the payment line that was just added
            const paymentLine = this.paymentLines.at(-1);
            if (paymentLine) {
                await this.processCreditPaymentLine(paymentLine);
            }
        }

        return result;
    },

    /**
     * Process credit payment line through the controller
     * @param {Object} paymentLine - The payment line to process
     */
    // eslint-disable-next-line complexity
    async processCreditPaymentLine(paymentLine) {
        const order = this.currentOrder;
        const partner = order.partner_id;
        if (!partner) {
            order.remove_paymentline(paymentLine);
            return;
        }
        const decimals = this.pos.currency?.decimal_places || 2;
        const availableCredit = floatIsZero(partner.credit_amount, decimals)
            ? 0
            : partner.credit_amount;
        const amount = paymentLine.amount;

        // Check if this is a refund
        const isRefund = amount < 0;

        // Validate credit balance for payments (not refunds)
        if (
            !isRefund &&
            availableCredit < amount &&
            !floatIsZero(amount - availableCredit, decimals)
        ) {
            if (floatIsZero(availableCredit, decimals) || availableCredit <= 0) {
                await this.dialog.add(AlertDialog, {
                    title: _t("Insufficient Credit"),
                    body: _t(
                        "Customer has insufficient credit balance. Available: %s, Required: %s",
                        this.env.utils.formatCurrency(availableCredit),
                        this.env.utils.formatCurrency(amount)
                    ),
                });
                // Remove the payment line
                order.remove_paymentline(paymentLine);
                return;
            }
            const confirmed = await ask(this.dialog, {
                title: _t("Partial Credit Available"),
                body: _t(
                    "Customer has only %s credit available. Do you want to apply the available credit and pay the rest with another method?",
                    this.env.utils.formatCurrency(availableCredit)
                ),
            });
            if (confirmed) {
                // Adjust the payment line to use the available credit
                paymentLine.set_amount(availableCredit);
                this.render();
                // Let the user add another payment line for the remaining amount
                return;
            }
            // Remove the payment line if they don't want to proceed
            order.remove_paymentline(paymentLine);
            return;
        }

        // Confirm the action
        const confirmMessage = isRefund
            ? _t(
                  "Process refund of %s to customer credit?\n\nCurrent balance: %s\nNew balance: %s",
                  this.env.utils.formatCurrency(Math.abs(amount)),
                  this.env.utils.formatCurrency(availableCredit),
                  this.env.utils.formatCurrency(availableCredit + Math.abs(amount))
              )
            : _t(
                  "Pay %s with customer credit?\n\nCurrent balance: %s\nRemaining: %s",
                  this.env.utils.formatCurrency(amount),
                  this.env.utils.formatCurrency(availableCredit),
                  this.env.utils.formatCurrency(availableCredit - amount)
              );

        const confirmed = await ask(this.dialog, {
            title: isRefund
                ? _t("Confirm Refund to Credit")
                : _t("Confirm Credit Payment"),
            body: confirmMessage,
        });

        if (!confirmed) {
            // Remove the payment line if not confirmed
            order.remove_paymentline(paymentLine);
            return;
        }

        // Process the payment through the controller
        const result = await this.pos.processCreditPayment(paymentLine);

        if (result.status === "success") {
            // Payment succeeded - paymentLine is already marked as done in processCreditPayment
            if (order.is_paid() && this.pos.config.auto_validate_terminal_payment) {
                if (this._creditAutoValidateInProgress) {
                    return;
                }
                this._creditAutoValidateInProgress = true;
                try {
                    await this.validateOrder(true);
                } finally {
                    this._creditAutoValidateInProgress = false;
                }
            } else {
                this.render();
            }
        } else {
            await this.dialog.add(AlertDialog, {
                title: _t("Payment Failed"),
                body:
                    result.error ||
                    _t("An error occurred while processing the payment."),
            });
            // Remove the payment line on failure
            order.remove_paymentline(paymentLine);
        }
    },

    /**
     * Override validateOrder to ensure credit payments are processed
     */
    async validateOrder(isForceValidate) {
        const order = this.currentOrder;

        // Check if there are any credit payment lines that haven't been processed
        const unprocessedCreditPayments =
            order.payment_ids?.filter(
                (line) =>
                    line.payment_method_id?.use_payment_terminal === "credit" &&
                    !line.is_done()
            ) || [];

        // Auto-process credit payments that were auto-applied
        if (unprocessedCreditPayments.length > 0) {
            for (const paymentLine of unprocessedCreditPayments) {
                // If this payment method has auto_apply enabled, process automatically
                if (paymentLine.payment_method_id?.auto_apply_credit_amount) {
                    // Process without confirmation dialog
                    await this.processAutoCreditPaymentLine(paymentLine);
                } else {
                    // Manual credit payments require confirmation
                    await this.dialog.add(AlertDialog, {
                        title: _t("Unprocessed Credit Payments"),
                        body: _t(
                            "Please process all credit payments before validating the order."
                        ),
                    });
                    return;
                }
            }
        }

        return await super.validateOrder(isForceValidate);
    },

    /**
     * Process auto-applied credit payment line without confirmation
     * @param {Object} paymentLine - The payment line to process
     */
    async processAutoCreditPaymentLine(paymentLine) {
        const order = this.currentOrder;
        const partner = order.partner_id;
        const amount = paymentLine.amount;
        const decimals = this.pos.currency?.decimal_places || 2;
        const availableCredit = floatIsZero(partner.credit_amount, decimals)
            ? 0
            : partner.credit_amount;

        // Validate credit balance
        if (
            availableCredit < amount &&
            !floatIsZero(amount - availableCredit, decimals)
        ) {
            await this.dialog.add(AlertDialog, {
                title: _t("Insufficient Credit"),
                body: _t(
                    "Customer has insufficient credit balance. Available: %s, Required: %s",
                    this.env.utils.formatCurrency(availableCredit),
                    this.env.utils.formatCurrency(amount)
                ),
            });
            // Remove the payment line
            order.remove_paymentline(paymentLine);
        }

        // Process the payment through the controller silently
        const result = await this.pos.processCreditPayment(paymentLine);

        if (result.status !== "success") {
            await this.dialog.add(AlertDialog, {
                title: _t("Payment Failed"),
                body:
                    result.error ||
                    _t("An error occurred while processing the payment."),
            });
            // Remove the payment line on failure
            order.remove_paymentline(paymentLine);
        }
    },

    /**
     * Auto-apply credit payment if conditions are met
     */
    // eslint-disable-next-line complexity
    autoApplyCreditPayment() {
        const order = this.currentOrder;
        const partner = order.partner_id;
        const decimals = this.pos.currency?.decimal_places || 2;
        const availableCredit = floatIsZero(partner?.credit_amount || 0, decimals)
            ? 0
            : partner?.credit_amount || 0;

        if (!partner || availableCredit <= 0) {
            return;
        }

        // Find credit payment methods with auto_apply enabled
        const autoCreditMethods = this.payment_methods_from_config.filter(
            (pm) => pm.use_payment_terminal === "credit" && pm.auto_apply_credit_amount
        );

        if (autoCreditMethods.length === 0) {
            return;
        }

        // Check if credit payment is already applied
        const existingCreditPayment = order.payment_ids?.find(
            (line) =>
                line.payment_method_id?.use_payment_terminal === "credit" &&
                !line.is_done()
        );

        if (existingCreditPayment) {
            // Update existing credit payment amount if needed
            const dueAmount = order.get_due(existingCreditPayment);
            const optimalAmount = Math.min(availableCredit, dueAmount);

            if (
                optimalAmount > 0 &&
                !floatIsZero(existingCreditPayment.amount - optimalAmount, decimals)
            ) {
                existingCreditPayment.set_amount(optimalAmount);
                this.render();
            }
            // Already has credit payment
            return;
        }

        // Calculate amount to apply (min of available credit and order due)
        const dueAmount = order.get_due();
        if (dueAmount <= 0) {
            // Order is fully paid
            return;
        }

        const creditToApply = Math.min(availableCredit, dueAmount);
        if (floatIsZero(creditToApply, decimals)) {
            return;
        }
        // Use first auto-apply method
        const paymentMethod = autoCreditMethods[0];

        // Add the credit payment line without triggering terminal processing
        const newPaymentline = order.add_paymentline(paymentMethod);
        newPaymentline.set_amount(creditToApply);

        // Mark as pending for user confirmation
        // Don't auto-process, let validateOrder handle it
        this.render();
    },
});
