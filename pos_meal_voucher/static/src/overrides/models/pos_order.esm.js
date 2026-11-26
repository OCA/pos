import {PosOrder} from "@point_of_sale/app/models/pos_order";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {roundPrecision} from "@web/core/utils/numbers";

patch(PosOrder.prototype, {
    setup(vals) {
        super.setup(vals);
        this.payment_note = vals.payment_note || "";
    },
    get_total_meal_voucher_eligible() {
        return roundPrecision(
            this.lines.reduce(function (sum, orderLine) {
                if (orderLine.product_id.meal_voucher_ok) {
                    return sum + orderLine.get_price_with_tax();
                }
                return sum;
            }, 0),
            this.currency.rounding
        );
    },
    get_total_meal_voucher_non_eligible() {
        return roundPrecision(
            this.lines.reduce(function (sum, orderLine) {
                if (!orderLine.product_id.meal_voucher_ok) {
                    return sum + orderLine.get_price_with_tax();
                }
                return sum;
            }, 0),
            this.currency.rounding
        );
    },
    get_total_meal_voucher_received() {
        return roundPrecision(
            this.payment_ids.reduce(function (sum, paymentLine) {
                if (paymentLine.is_meal_voucher()) {
                    return sum + paymentLine.get_amount();
                }
                return sum;
            }, 0),
            this.currency.rounding
        );
    },
    export_for_printing(baseUrl, headerData) {
        const paidWithMealVoucher = Boolean(
            this.payment_ids.filter((paymentLine) => paymentLine.is_meal_voucher())
                .length
        );
        const displayInfoMealVoucher =
            this.config.enable_meal_voucher_receipt_info && paidWithMealVoucher;
        const result = super.export_for_printing(baseUrl, headerData);
        result.paidWithMealVoucher = paidWithMealVoucher;
        result.display_meal_voucher_info = displayInfoMealVoucher;
        result.meal_voucher_info = {
            meal_voucher_note: _t(
                "Products marked with a star (*) are eligible for Meal vouchers."
            ),
            total_eligible: this.get_total_meal_voucher_eligible(),
            label_eligible: _t("Eligible Total"),
            total_non_eligible: this.get_total_meal_voucher_non_eligible(),
            label_non_eligible: _t("Non-Eligible Total"),
        };
        return result;
    },
    _meal_voucher_is_valid(code) {
        if (this.payment_note === code) {
            return false;
        }
        return true;
    },
    async handle_meal_voucher_barcode(code) {
        if (!this._meal_voucher_is_valid(code.code)) {
            return {
                title: _t("Invalid Meal Voucher"),
                body: _t(
                    "The paper meal voucher with code '%s' has already been scanned.",
                    code.code
                ),
            };
        }
        // Add new payment line with the amount found in the barcode.
        const payment_line = this.add_paymentline(
            this.config.paper_meal_voucher_payment_method
        );
        payment_line.set_amount(code.value);
        this.payment_note = code.code;
        return true;
    },
    canBeValidated() {
        const res = super.canBeValidated();
        const paidWithMealVoucher = Boolean(
            this.payment_ids.filter((paymentLine) => paymentLine.is_meal_voucher())
                .length
        );
        if (!paidWithMealVoucher) {
            return res;
        }
        const mealVoucherReceivedAmount = this.get_total_meal_voucher_received();
        const mealVoucherTotalEligible = this.get_total_meal_voucher_eligible();
        const maxMealVoucherAmount = this.config.max_meal_voucher_amount || 0;
        return (
            res &&
            mealVoucherReceivedAmount <= mealVoucherTotalEligible &&
            mealVoucherReceivedAmount <= maxMealVoucherAmount
        );
    },
});
