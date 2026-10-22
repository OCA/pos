/** @odoo-module */

import {ConfirmPopup} from "@point_of_sale/app/utils/confirm_popup/confirm_popup";
import {ForeignCurrencyPopup} from "@pos_multi_currency/app/popups/foreign_currency_popup.esm";
import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    foreignCurrencyAvailable() {
        const line = this.selectedPaymentLine;
        return Boolean(
            this.pos.foreign_currencies.length && line && line.canUseForeignCurrency()
        );
    },
    async openForeignCurrencyPopup() {
        const line = this.selectedPaymentLine;
        if (!line || !line.canUseForeignCurrency()) {
            return;
        }
        const {confirmed, payload} = await this.popup.add(ForeignCurrencyPopup, {
            paymentline: line,
        });
        if (!confirmed || !payload) {
            return;
        }
        if (payload.clear) {
            line.clearForeignCurrency();
            // Core leaves the keypad empty, so the next digit replaces the
            // amount. Putting the amount in the buffer makes the digit append.
            this._committedForeignBuffer = null;
            this.numberBuffer.reset();
            return;
        }
        line.applyForeignCurrency(payload.currency, payload.amount);
        // Keep the keypad on the foreign amount, so +10 adds ten of that
        // currency. A digit typed afterwards must not change that amount.
        this._syncPaymentBuffer(line);
    },
    /**
     * Keypad text for an amount, using the locale decimal point.
     *
     * ``toFixed`` always writes a dot. Italian, German, Spanish and Dutch
     * parse that dot as a thousands separator, so 30.00 becomes 3000.
     *
     * @param {Number} amount
     * @param {Number} decimalPlaces
     * @returns {String}
     */
    _formatKeypadAmount(amount, decimalPlaces) {
        const point = this.numberBuffer.decimalPoint || ".";
        return amount.toFixed(decimalPlaces).replace(".", point);
    },
    /**
     * Point the keypad at the foreign amount it now edits.
     *
     * The line already has a foreign currency. The text keeps that
     * currency's decimal places. A later digit is appended to it
     * ("500,00" and "5" is "500,005") and rounding that turns 500.00
     * into 500.01, so that digit is ignored.
     *
     * @param {Object} line selected payment line, with a foreign currency
     */
    _syncPaymentBuffer(line) {
        const currency = this.pos.foreignCurrencyById[line.foreign_currency_id];
        this._committedForeignBuffer = this._formatKeypadAmount(
            line.foreign_amount,
            currency.decimal_places
        );
        this.numberBuffer.set(this._committedForeignBuffer);
    },
    /**
     * Foreign amount currently in the keypad.
     *
     * +10, +20 and +50 add to the buffer and write the sum with
     * ``Number.toString``, which always uses a dot. In a comma-decimal
     * language the locale parser reads that dot as a thousands
     * separator, so 48,35 plus 10 becomes 5835. A dot in that buffer
     * is the decimal point.
     *
     * @returns {Number}
     */
    _foreignKeypadAmount() {
        const raw = this.numberBuffer.get();
        const point = this.numberBuffer.decimalPoint || ".";
        if (raw && point !== "." && raw.includes(".") && !raw.includes(point)) {
            return Number.parseFloat(raw);
        }
        return this.numberBuffer.getFloat();
    },
    /**
     * A digit was appended to the foreign amount already on the line.
     *
     * @returns {Boolean}
     */
    _foreignDigitExtendsCommittedAmount() {
        const committed = this._committedForeignBuffer;
        const raw = this.numberBuffer.get();
        return Boolean(
            committed &&
                raw &&
                raw.startsWith(committed) &&
                raw.length > committed.length
        );
    },
    selectPaymentLine(cid) {
        super.selectPaymentLine(cid);
        const line = this.selectedPaymentLine;
        if (line && line.foreign_currency_id) {
            this._syncPaymentBuffer(line);
        }
    },
    updateSelectedPaymentline(amount = false) {
        const line = this.selectedPaymentLine;
        if (line && line.foreign_currency_id) {
            if (amount === false && this._foreignDigitExtendsCommittedAmount()) {
                this.numberBuffer.set(this._committedForeignBuffer);
                return;
            }
            let foreignAmount = amount;
            if (foreignAmount === false) {
                if (this.numberBuffer.get() === null) {
                    foreignAmount = null;
                } else if (this.numberBuffer.get() === "") {
                    foreignAmount = 0;
                } else {
                    foreignAmount = this._foreignKeypadAmount();
                }
            }
            if (foreignAmount === null) {
                this.deletePaymentLine(line.cid);
            } else {
                line.setForeignAmount(foreignAmount);
                this._syncPaymentBuffer(line);
            }
            return;
        }
        this._committedForeignBuffer = null;
        return super.updateSelectedPaymentline(...arguments);
    },
    async validateOrder() {
        if (!(await this._confirmForeignCashPayout())) {
            return;
        }
        return super.validateOrder(...arguments);
    },
    /**
     * Warn when a foreign cash refund is larger than the drawer.
     *
     * The server never blocks the refund. An offline session skips the warning.
     *
     * @returns {Promise<Boolean>}
     */
    async _confirmForeignCashPayout() {
        if (!this.pos.config.cash_control) {
            return true;
        }
        const methodId = this.pos.cash_control_method_id;
        const payouts = {};
        for (const line of this.currentOrder.paymentlines) {
            if (
                line.payment_method.id === methodId &&
                line.foreign_currency_id &&
                line.foreign_amount < 0
            ) {
                payouts[line.foreign_currency_id] =
                    (payouts[line.foreign_currency_id] || 0) +
                    Math.abs(line.foreign_amount);
            }
        }
        if (!Object.keys(payouts).length) {
            return true;
        }
        let expected = {};
        try {
            expected = await this.orm.call("pos.session", "get_foreign_cash_expected", [
                [this.pos.pos_session.id],
            ]);
        } catch {
            return true;
        }
        const unsynced = this._unsyncedForeignCash(methodId);
        for (const [currencyId, payout] of Object.entries(payouts)) {
            const currency = this.pos.foreignCurrencyById[currencyId];
            const drawer = (expected[currencyId] || 0) + (unsynced[currencyId] || 0);
            if (payout > drawer + currency.rounding / 2) {
                const {confirmed} = await this.popup.add(ConfirmPopup, {
                    title: _t("Not enough %(currency)s in the drawer", {
                        currency: currency.name,
                    }),
                    body: _t(
                        "This refund pays out more %(currency)s than the cash drawer holds. Continue anyway?",
                        {currency: currency.name}
                    ),
                });
                if (!confirmed) {
                    return false;
                }
            }
        }
        return true;
    },
    /**
     * Foreign cash of orders saved locally and not yet sent to the server.
     *
     * @param {Number} methodId cash payment method id
     * @returns {Object} currency id to signed amount
     */
    _unsyncedForeignCash(methodId) {
        const totals = {};
        for (const order of this.pos.db.get_orders()) {
            for (const statement of order.data.statement_ids || []) {
                const payment = statement[2];
                if (
                    payment.payment_method_id === methodId &&
                    payment.foreign_currency_id
                ) {
                    totals[payment.foreign_currency_id] =
                        (totals[payment.foreign_currency_id] || 0) +
                        payment.amount_currency;
                }
            }
        }
        return totals;
    },
});
