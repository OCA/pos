/** @odoo-module */
/* Copyright 2026 Cetmix OÜ
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {Order, Orderline, Payment} from "@point_of_sale/app/store/models";
import {floatIsZero, roundPrecision} from "@web/core/utils/numbers";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

/**
 * Round a value to a step, like the server float_round()
 * (odoo/tools/float_utils.py). roundPrecision() only rounds HALF-UP.
 *
 * @param {Number} value value to round
 * @param {Number} precision rounding step, e.g. 0.05
 * @param {String} method "UP", "DOWN" or "HALF-UP"
 * @returns {Number} rounded value
 */
function floatRound(value, precision, method) {
    if (method !== "UP" && method !== "DOWN") {
        return roundPrecision(value, precision);
    }
    if (!value) {
        return 0;
    }
    let normalizedValue = value / precision;
    const sign = normalizedValue < 0 ? -1.0 : 1.0;
    const epsilon = Math.pow(2, Math.log2(Math.abs(normalizedValue)) - 52);
    if (method === "UP") {
        normalizedValue -= sign * epsilon;
        return Math.ceil(Math.abs(normalizedValue)) * sign * precision;
    }
    normalizedValue += sign * epsilon;
    return Math.floor(Math.abs(normalizedValue)) * sign * precision;
}

patch(Order.prototype, {
    setup() {
        // Set before super: super restores a saved order through init_from_JSON.
        this.write_off_amount = 0;
        super.setup(...arguments);
    },
    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        // Restored last: restoring the lines goes through the mutators,
        // which clear the mark.
        this.write_off_amount = json.write_off_amount || 0;
        if (this.write_off_amount) {
            this.mark_paid_total = json.mark_paid_total ?? this.get_total_with_tax();
            this.mark_paid_paid = json.mark_paid_paid ?? this.get_total_paid();
        }
    },
    export_as_JSON() {
        const json = super.export_as_JSON(...arguments);
        json.write_off_amount = this.write_off_amount;
        json.mark_paid_total = this.mark_paid_total;
        json.mark_paid_paid = this.mark_paid_paid;
        return json;
    },
    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        result.write_off_amount = this.write_off_amount;
        result.write_off_label = this.pos.config.mark_paid_label;
        return result;
    },
    add_orderline() {
        this.clearMarkPaid();
        return super.add_orderline(...arguments);
    },
    removeOrderline() {
        this.clearMarkPaid();
        return super.removeOrderline(...arguments);
    },
    add_paymentline() {
        this.clearMarkPaid();
        return super.add_paymentline(...arguments);
    },
    remove_paymentline() {
        this.clearMarkPaid();
        return super.remove_paymentline(...arguments);
    },
    get_rounding_applied() {
        if (this.isMarkedPaid()) {
            return roundPrecision(
                this.getMarkPaidAmountToPay() - this.get_total_with_tax(),
                this.pos.currency.rounding
            );
        }
        return super.get_rounding_applied(...arguments);
    },
    get_due(paymentline) {
        const due = super.get_due(...arguments);
        if (!paymentline && this.isMarkedPaid()) {
            return roundPrecision(
                due - this.write_off_amount,
                this.pos.currency.rounding
            );
        }
        return due;
    },
    /**
     * @returns {Boolean} whether the residual of the order is written off
     */
    isMarkedPaid() {
        return this.write_off_amount > 0;
    },
    /**
     * Amount to pay: the total rounded with the cash rounding of the POS when
     * set, then to the currency. Same as the server
     * pos.order._get_rounded_amount(amount_total, force_round=True).
     *
     * @returns {Number} amount to pay
     */
    getMarkPaidAmountToPay() {
        let total = this.get_total_with_tax();
        if (this.pos.config.cash_rounding) {
            const cashRounding = this.pos.cash_rounding[0];
            total = floatRound(
                total,
                cashRounding.rounding,
                cashRounding.rounding_method
            );
        }
        return roundPrecision(total, this.pos.currency.rounding);
    },
    /**
     * @returns {Number} part of the amount to pay that is not paid yet
     */
    getMarkPaidResidual() {
        return roundPrecision(
            this.getMarkPaidAmountToPay() - this.get_total_paid(),
            this.pos.currency.rounding
        );
    },
    /**
     * Check the rules of Mark as Paid, in order.
     *
     * @returns {String|false} message of the first rule not met, or false
     */
    getMarkPaidError() {
        const config = this.pos.config;
        const total = this.get_total_with_tax();
        const residual = this.getMarkPaidResidual();
        const decimals = this.pos.currency.decimal_places;
        const formatCurrency = this.env.utils.formatCurrency;
        if (total <= 0 || floatIsZero(total, decimals)) {
            return _t(
                "Mark as Paid is only available for orders with a positive total."
            );
        }
        if (residual <= 0 || floatIsZero(residual, decimals)) {
            return _t("Nothing is left to pay.");
        }
        const paymentlines = this.get_paymentlines();
        if (
            !paymentlines.some(
                (line) =>
                    line.payment_method.is_cash_count &&
                    line.get_amount() > 0 &&
                    !floatIsZero(line.get_amount(), decimals)
            )
        ) {
            return _t("Mark as Paid requires a cash payment.");
        }
        if (paymentlines.some((line) => line.payment_method.type === "pay_later")) {
            return _t("Mark as Paid is not available with a Customer Account payment.");
        }
        const maxAmount = config.mark_paid_max_amount;
        if (
            maxAmount &&
            residual > maxAmount &&
            !floatIsZero(residual - maxAmount, decimals)
        ) {
            return _t(
                "The residual %(residual)s exceeds the maximum write-off of %(max)s.",
                {
                    residual: formatCurrency(residual),
                    max: formatCurrency(maxAmount),
                }
            );
        }
        const maxPercent = config.mark_paid_max_percent;
        const maxByPercent = roundPrecision(
            (total * maxPercent) / 100,
            this.pos.currency.rounding
        );
        if (
            maxPercent &&
            residual > maxByPercent &&
            !floatIsZero(residual - maxByPercent, decimals)
        ) {
            return _t(
                // Single "%": sprintf() of web/core/utils/strings.js has no "%%" escape.
                "The residual %(residual)s exceeds %(percent)s% of the order total (%(max)s).",
                {
                    residual: formatCurrency(residual),
                    percent: maxPercent,
                    max: formatCurrency(maxByPercent),
                }
            );
        }
        if (!paymentlines.every((line) => line.is_done())) {
            return _t("Finish or remove the pending payments first.");
        }
        return false;
    },
    /**
     * Write off the residual, and record the totals it was computed from.
     */
    markPaid() {
        this.write_off_amount = this.getMarkPaidResidual();
        this.mark_paid_total = this.get_total_with_tax();
        this.mark_paid_paid = this.get_total_paid();
    },
    clearMarkPaid() {
        this.write_off_amount = 0;
        this.mark_paid_total = undefined;
        this.mark_paid_paid = undefined;
    },
    /**
     * Clear the mark when the order changed in a way the mutators do not see:
     * other totals than when it was marked, or a payment line that is not done.
     */
    clearStaleMarkPaid() {
        if (!this.isMarkedPaid()) {
            return;
        }
        const decimals = this.pos.currency.decimal_places;
        if (
            !floatIsZero(this.get_total_with_tax() - this.mark_paid_total, decimals) ||
            !floatIsZero(this.get_total_paid() - this.mark_paid_paid, decimals) ||
            !this.get_paymentlines().every((line) => line.is_done())
        ) {
            this.clearMarkPaid();
        }
    },
});

patch(Orderline.prototype, {
    set_quantity() {
        this.order?.clearMarkPaid();
        return super.set_quantity(...arguments);
    },
    set_unit_price() {
        this.order?.clearMarkPaid();
        return super.set_unit_price(...arguments);
    },
    set_discount() {
        this.order?.clearMarkPaid();
        return super.set_discount(...arguments);
    },
});

patch(Payment.prototype, {
    set_amount() {
        this.order?.clearMarkPaid();
        return super.set_amount(...arguments);
    },
});
