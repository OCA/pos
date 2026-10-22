/** @odoo-module */

import {onWillStart, useState} from "@odoo/owl";
import {ClosePosPopup} from "@point_of_sale/app/navbar/closing_popup/closing_popup";
import {formatCurrency} from "@web/core/currency";
import {parseFloat} from "@web/views/fields/parsers";
import {patch} from "@web/core/utils/patch";

patch(ClosePosPopup.prototype, {
    setup() {
        super.setup(...arguments);
        this.foreignState = useState({lines: []});
        onWillStart(async () => {
            if (!this.pos.foreign_currencies.length) {
                return;
            }
            const lines = await this.orm.call(
                "pos.session",
                "get_foreign_closing_data",
                [[this.pos.pos_session.id]]
            );
            this.foreignState.lines = lines.map((line) => ({
                ...line,
                counted:
                    line.type === "cash"
                        ? formatCurrency(0, line.currency_id, {noSymbol: true})
                        : formatCurrency(line.expected, line.currency_id, {
                              noSymbol: true,
                          }),
            }));
        });
    },
    canConfirm() {
        const foreignOk = this.foreignState.lines.every((line) =>
            this.env.utils.isValidFloat(line.counted)
        );
        return super.canConfirm(...arguments) && foreignOk;
    },
    foreignDifference(line) {
        if (!this.env.utils.isValidFloat(line.counted)) {
            return NaN;
        }
        return parseFloat(line.counted) - line.expected;
    },
    formatForeignAmount(amount, currencyId) {
        return formatCurrency(amount, currencyId);
    },
    getMaxDifference() {
        const base = super.getMaxDifference(...arguments);
        const converted = this.foreignState.lines.map((line) => {
            const difference = this.foreignDifference(line);
            if (Number.isNaN(difference) || !line.rate) {
                return 0;
            }
            return Math.abs(difference / line.rate);
        });
        return Math.max(base, ...converted);
    },
    async closeSession() {
        if (this.foreignState.lines.length) {
            await this.orm.call("pos.session", "set_foreign_closing_counts", [
                [this.pos.pos_session.id],
                this.foreignState.lines.map((line) => ({
                    payment_method_id: line.payment_method_id,
                    currency_id: line.currency_id,
                    amount: parseFloat(line.counted),
                })),
            ]);
        }
        return super.closeSession(...arguments);
    },
});
