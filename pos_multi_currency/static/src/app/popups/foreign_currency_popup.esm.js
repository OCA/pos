/** @odoo-module */

import {
    floatIsZero,
    roundDecimals as round_di,
    roundPrecision as round_pr,
} from "@web/core/utils/numbers";
import {onMounted, useRef, useState} from "@odoo/owl";
import {AbstractAwaitablePopup} from "@point_of_sale/app/popup/abstract_awaitable_popup";
import {foreignRateLabel} from "@pos_multi_currency/app/utils/foreign_rate.esm";
import {formatCurrency} from "@web/core/currency";
import {parseFloat} from "@web/views/fields/parsers";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";

export class ForeignCurrencyPopup extends AbstractAwaitablePopup {
    static template = "pos_multi_currency.ForeignCurrencyPopup";

    setup() {
        super.setup();
        this.pos = usePos();
        this.numberBuffer = useService("number_buffer");
        this.amountInput = useRef("foreignAmount");
        const line = this.props.paymentline;
        const currencies = this.pos.foreign_currencies;
        const current = line.foreign_currency_id
            ? this.pos.foreignCurrencyById[line.foreign_currency_id]
            : currencies[0];
        this.state = useState({
            currencyId: current.id,
            amount: "",
            // Stays equal to `amount` until the cashier types another tender.
            proposedAmount: false,
        });
        if (line.foreign_currency_id) {
            this.state.amount = formatCurrency(line.foreign_amount, current.id, {
                noSymbol: true,
            });
        } else {
            this._proposeAmount();
        }
        onMounted(() => {
            const input = this.amountInput.el;
            if (input) {
                input.focus();
                input.select();
            }
        });
    }
    get selectedCurrency() {
        return this.pos.foreignCurrencyById[this.state.currencyId];
    }
    rateLabel(currency) {
        return foreignRateLabel(this.pos.currency.name, currency.rate, currency.name);
    }
    get foreignDue() {
        const line = this.props.paymentline;
        const currency = this.selectedCurrency;
        const rate =
            line.foreign_currency_id === currency.id
                ? line.foreign_currency_rate
                : currency.rate;
        // Always pass the line so get_due excludes its pre-filled POS amount.
        return line.order.getForeignDue({...currency, rate}, line);
    }
    get posEquivalent() {
        if (!this.env.utils.isValidFloat(this.state.amount)) {
            return 0;
        }
        const line = this.props.paymentline;
        const currency = this.selectedCurrency;
        const amount = parseFloat(this.state.amount);
        const preview = Object.create(line);
        preview.foreign_currency_rate = currency.rate;
        return line.computeAmountFromForeign.call(preview, amount);
    }
    formatForeign(amount) {
        return formatCurrency(amount, this.selectedCurrency.id);
    }
    /**
     * Fill the amount received from the number already on the payment line.
     *
     * That number is the amount in the currency the cashier is about to pick.
     * Typing 500 and choosing euro means 500 euro. The Point of Sale amount
     * is that 500 converted at the rate. A line that still holds the amount
     * due, because nothing was typed, starts as the foreign amount due.
     * Cash rounding is part of that prefilled amount and is not a typed tender.
     */
    _proposeAmount() {
        const line = this.props.paymentline;
        const currency = this.selectedCurrency;
        const posAmount = line.get_amount();
        const prefilled = round_pr(
            line.order.get_due(line) + line.order.get_rounding_applied(),
            this.pos.currency.rounding
        );
        // An empty keypad is what core leaves after the payment method click.
        // A typed number can equal that prefilled amount and is still foreign.
        const untouched =
            !this.numberBuffer.get() &&
            floatIsZero(posAmount - prefilled, this.pos.currency.decimal_places);
        const foreign = untouched
            ? this.foreignDue
            : round_di(posAmount, currency.decimal_places);
        const proposed = formatCurrency(foreign, currency.id, {noSymbol: true});
        this.state.proposedAmount = proposed;
        this.state.amount = proposed;
    }
    selectCurrency(currencyId) {
        const followsProposal = this.state.amount === this.state.proposedAmount;
        this.state.currencyId = currencyId;
        if (followsProposal) {
            this._proposeAmount();
        }
    }
    canApply() {
        // A blank field passes the float check, and parsing it yields 0.
        // Apply would replace the payment line with 0.00 in both currencies.
        return (
            Boolean(this.state.amount) && this.env.utils.isValidFloat(this.state.amount)
        );
    }
    async confirm() {
        if (!this.canApply()) {
            return;
        }
        return super.confirm();
    }
    usePosCurrency() {
        this.props.close({confirmed: true, payload: {clear: true}});
    }
    getPayload() {
        return {
            clear: false,
            currency: this.selectedCurrency,
            amount: parseFloat(this.state.amount),
        };
    }
}
