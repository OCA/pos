/** @odoo-module */

import {onWillStart, useState} from "@odoo/owl";
import {CashOpeningPopup} from "@point_of_sale/app/store/cash_opening_popup/cash_opening_popup";
import {formatCurrency} from "@web/core/currency";
import {parseFloat} from "@web/views/fields/parsers";
import {patch} from "@web/core/utils/patch";

patch(CashOpeningPopup.prototype, {
    setup() {
        super.setup(...arguments);
        this.foreignLines = useState({lines: []});
        onWillStart(async () => {
            if (!this.pos.foreign_currencies.length) {
                return;
            }
            const rows = await this.orm.call(
                "pos.session",
                "get_foreign_opening_data",
                [[this.pos.pos_session.id]]
            );
            this.foreignLines.lines = rows.map((row) => ({
                ...row,
                counted: formatCurrency(row.expected, row.currency_id, {
                    noSymbol: true,
                }),
            }));
        });
    },
    canOpenSession() {
        const foreignOk = this.foreignLines.lines.every((line) =>
            this.env.utils.isValidFloat(line.counted)
        );
        return this.env.utils.isValidFloat(this.state.openingCash) && foreignOk;
    },
    async confirm() {
        if (this.foreignLines.lines.length) {
            await this.orm.call("pos.session", "set_foreign_opening", [
                [this.pos.pos_session.id],
                this.foreignLines.lines.map((line) => ({
                    currency_id: line.currency_id,
                    amount: parseFloat(line.counted),
                })),
            ]);
        }
        return super.confirm(...arguments);
    },
});
