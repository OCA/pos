/** @odoo-module */

import {CashMovePopup} from "@point_of_sale/app/navbar/cash_move_popup/cash_move_popup";
import {CashMoveReceipt} from "@point_of_sale/app/navbar/cash_move_popup/cash_move_receipt/cash_move_receipt";
import {_t} from "@web/core/l10n/translation";
import {formatCurrency} from "@web/core/currency";
import {formatDateTime} from "@web/core/l10n/dates";
import {parseFloat} from "@web/views/fields/parsers";
import {patch} from "@web/core/utils/patch";

const {DateTime} = luxon;

patch(CashMovePopup.prototype, {
    setup() {
        super.setup(...arguments);
        this.state.currencyId = this.pos.currency.id;
    },
    get cashMoveCurrency() {
        return this.pos.foreignCurrencyById[this.state.currencyId] || this.pos.currency;
    },
    format(value) {
        if (this.cashMoveCurrency.id === this.pos.currency.id) {
            return super.format(...arguments);
        }
        return this.env.utils.isValidFloat(value)
            ? formatCurrency(parseFloat(value), this.cashMoveCurrency.id)
            : "";
    },
    async confirm() {
        const currencyId = Number(this.state.currencyId);
        if (!currencyId || currencyId === this.pos.currency.id) {
            return super.confirm(...arguments);
        }
        const amount = parseFloat(this.state.amount);
        const currency = this.pos.foreignCurrencyById[currencyId];
        const formattedAmount = formatCurrency(amount, currencyId, {
            digits: [69, currency.decimal_places],
        });
        if (!amount) {
            this.notification.add(
                _t("Cash in/out of %s is ignored.", formattedAmount),
                3000
            );
            return this.props.close();
        }
        const type = this.state.type;
        const translatedType = _t(type);
        const extras = {formattedAmount, translatedType, currency_id: currencyId};
        const reason = this.state.reason.trim();
        await this.orm.call("pos.session", "try_cash_in_out", [
            [this.pos.pos_session.id],
            type,
            amount,
            reason,
            extras,
        ]);
        await this.pos.logEmployeeMessage(
            `${_t("Cash")} ${translatedType} - ${_t("Amount")}: ${formattedAmount}`,
            "CASH_DRAWER_ACTION"
        );
        await this.printer.print(CashMoveReceipt, {
            reason,
            translatedType,
            formattedAmount,
            headerData: this.pos.getReceiptHeaderData(),
            date: formatDateTime(DateTime.now()),
        });
        this.props.close();
        this.notification.add(
            `${type === "in" ? _t("Cash In") : _t("Cash Out")}: ${formattedAmount}`,
            3000
        );
    },
});
