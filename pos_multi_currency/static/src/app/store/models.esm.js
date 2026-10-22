/** @odoo-module */

import {Order, Payment} from "@point_of_sale/app/store/models";
import {
    floatIsZero,
    roundDecimals as round_di,
    roundPrecision as round_pr,
} from "@web/core/utils/numbers";
import {foreignRateLabel} from "@pos_multi_currency/app/utils/foreign_rate.esm";
import {formatCurrency} from "@web/core/currency";
import {patch} from "@web/core/utils/patch";

patch(Payment.prototype, {
    setup() {
        // Defaults go before super. Core calls init_from_JSON inside setup
        // and returns, so values set afterwards would wipe a restored tender.
        this.foreign_currency_id = false;
        this.foreign_amount = 0;
        this.foreign_currency_rate = 0;
        super.setup(...arguments);
    },
    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        this.foreign_currency_id = json.foreign_currency_id || false;
        this.foreign_amount = json.amount_currency || 0;
        this.foreign_currency_rate = json.foreign_currency_rate || 0;
    },
    export_as_JSON() {
        const json = super.export_as_JSON(...arguments);
        if (this.foreign_currency_id) {
            json.foreign_currency_id = this.foreign_currency_id;
            json.amount_currency = this.foreign_amount;
            json.foreign_currency_rate = this.foreign_currency_rate;
        }
        return json;
    },
    export_for_printing() {
        const json = super.export_for_printing(...arguments);
        if (!this.foreign_currency_id) {
            return json;
        }
        const currency = this.pos.foreignCurrencyById[this.foreign_currency_id];
        json.foreign_currency_name = currency ? currency.name : "";
        json.foreign_amount_display = formatCurrency(
            this.foreign_amount,
            this.foreign_currency_id
        );
        json.foreign_rate_label = foreignRateLabel(
            this.pos.currency.name,
            this.foreign_currency_rate,
            json.foreign_currency_name
        );
        return json;
    },
    /**
     * Point of Sale amount for a foreign tender.
     *
     * A customer module overrides this to price the tender from a pricelist
     * instead of the currency rate. It also overrides
     * ``pos.payment._foreign_amount_matches_rate``.
     *
     * @param {Number} amountCurrency amount in the tender currency
     * @returns {Number} amount in the Point of Sale currency
     */
    computeAmountFromForeign(amountCurrency) {
        if (!this.foreign_currency_rate) {
            return 0;
        }
        return round_di(
            amountCurrency / this.foreign_currency_rate,
            this.pos.currency.decimal_places
        );
    },
    /**
     * Whether the cashier may pick a foreign currency for this line.
     *
     * @returns {Boolean}
     */
    canUseForeignCurrency() {
        const method = this.payment_method;
        if (!method || (method.type !== "cash" && method.type !== "bank")) {
            return false;
        }
        if (method.use_payment_terminal || this.is_change || this.payment_status) {
            return false;
        }
        if (method.type === "cash" && method.id !== this.pos.cash_control_method_id) {
            return false;
        }
        return true;
    },
    /**
     * Store a foreign tender and the matching Point of Sale amount.
     *
     * The exact foreign amount due settles the exact Point of Sale amount due.
     * Any other amount, including one cent more, is converted and may give change.
     *
     * @param {Number} amountCurrency
     */
    setForeignAmount(amountCurrency) {
        const currency = this.pos.foreignCurrencyById[this.foreign_currency_id];
        this.foreign_amount = round_di(amountCurrency || 0, currency.decimal_places);
        const due = this.order.getForeignDue(currency, this);
        if (floatIsZero(this.foreign_amount - due, currency.decimal_places)) {
            this.set_amount(this.order.get_due(this));
        } else {
            this.set_amount(this.computeAmountFromForeign(this.foreign_amount));
        }
    },
    applyForeignCurrency(currency, amountCurrency) {
        this.foreign_currency_id = currency.id;
        this.foreign_currency_rate = currency.rate;
        this.setForeignAmount(amountCurrency);
    },
    clearForeignCurrency() {
        const amount = this.get_amount();
        this.foreign_currency_id = false;
        this.foreign_amount = 0;
        this.foreign_currency_rate = 0;
        this.set_amount(amount);
    },
});

patch(Order.prototype, {
    /**
     * Foreign amount still due before a payment line.
     *
     * @param {Object} currency loaded foreign currency
     * @param {Object} paymentline payment line being edited
     * @returns {Number}
     */
    getForeignDue(currency, paymentline) {
        const posDue = this.get_due(paymentline);
        const rate =
            paymentline && paymentline.foreign_currency_id === currency.id
                ? paymentline.foreign_currency_rate
                : currency.rate;
        return round_di(posDue * rate, currency.decimal_places);
    },
    get_rounding_applied() {
        const lines = this.get_paymentlines();
        const lastLine = lines && lines.length ? lines[lines.length - 1] : false;
        if (lastLine && lastLine.foreign_currency_id) {
            return 0;
        }
        return super.get_rounding_applied(...arguments);
    },
    has_not_valid_rounding() {
        if (
            !this.pos.config.cash_rounding ||
            this.get_total_with_tax() < this.pos.cash_rounding[0].rounding
        ) {
            return false;
        }
        const onlyCash = this.pos.config.only_round_cash_method;
        for (const line of this.paymentlines) {
            if (line.foreign_currency_id) {
                continue;
            }
            if (onlyCash && !line.payment_method.is_cash_count) {
                continue;
            }
            if (
                !floatIsZero(
                    line.amount -
                        round_pr(line.amount, this.pos.cash_rounding[0].rounding),
                    6
                )
            ) {
                return line;
            }
        }
        return false;
    },
});
