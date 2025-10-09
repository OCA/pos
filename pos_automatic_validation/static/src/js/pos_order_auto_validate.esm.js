import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {browser} from "@web/core/browser/browser";
import {floatIsZero} from "@web/core/utils/numbers";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    async addNewPaymentLine(paymentMethod) {
        const result = await super.addNewPaymentLine(paymentMethod);

        if (
            paymentMethod?.is_automatic_validation &&
            !paymentMethod?.use_payment_terminal
        ) {
            this.setupAutoValidationTimer();
        }

        return result;
    },

    setupAutoValidationTimer() {
        if (this._autoValidationTimer) {
            browser.clearTimeout(this._autoValidationTimer);
        }

        // Wait a bit before auto-validating (allow user input)
        this._autoValidationTimer = browser.setTimeout(async () => {
            await this.checkAutoValidation();
        }, 1000);
    },

    async checkAutoValidation() {
        const order = this.pos.get_order();
        if (!order) {
            return;
        }

        // Ensure order.paymentlines exists and has content
        const paymentLines = this.paymentLines;

        if (!paymentLines.length) {
            return;
        }

        // Ensure order is fully paid
        if (
            !(
                order.is_paid() &&
                floatIsZero(order.get_due(), this.pos.currency.decimal_places)
            )
        ) {
            return;
        }

        // Check all payment lines for auto-validation condition
        const allAuto = paymentLines.every(
            (p) =>
                p.payment_method_id?.is_automatic_validation === true &&
                !p.payment_method_id?.use_payment_terminal
        );

        if (allAuto) {
            await this.validateOrder(true);
        }
    },
});
