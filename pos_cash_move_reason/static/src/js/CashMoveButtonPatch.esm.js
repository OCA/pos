/*
Copyright (C) 2026-Today: GRAP (https://www.grap.coop)
@author: Quentin DUPONT
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define("pos_cash_move_reason.CashMoveButtonPatch", function (require) {
    const CashMoveButton = require("point_of_sale.CashMoveButton");
    const Registries = require("point_of_sale.Registries");
    const {_t} = require("web.core");
    const {renderToString} = require("@web/core/utils/render");

    const TRANSLATED_CASH_MOVE_TYPE = {
        in: _t("in"),
        out: _t("out"),
    };

    const MyCashMoveButton = (CashMoveButton) =>
        class extends CashMoveButton {
            /* Rewrite all function to add extra field */
            async onClick() {
                const {confirmed, payload} = await this.showPopup("CashMovePopup");
                if (!confirmed) return;
                const {type, amount, reason, move_reason, journal_id} = payload;
                const translatedType = TRANSLATED_CASH_MOVE_TYPE[type];
                const formattedAmount = this.env.pos.format_currency(amount);
                if (!amount) {
                    return this.showNotification(
                        _.str.sprintf(
                            this.env._t("Cash in/out of %s is ignored."),
                            formattedAmount
                        ),
                        3000
                    );
                }
                const extras = {
                    formattedAmount,
                    translatedType,
                    move_reason,
                    journal_id,
                };
                await this.rpc({
                    model: "pos.session",
                    method: "try_cash_in_out",
                    args: [[this.env.pos.pos_session.id], type, amount, reason, extras],
                });
                if (this.env.proxy.printer) {
                    const renderedReceipt = renderToString(
                        "point_of_sale.CashMoveReceipt",
                        {
                            _receipt: this._getReceiptInfo({
                                ...payload,
                                translatedType,
                                formattedAmount,
                            }),
                        }
                    );
                    const printResult = await this.env.proxy.printer.print_receipt(
                        renderedReceipt
                    );
                    if (!printResult.successful) {
                        this.showPopup("ErrorPopup", {
                            title: printResult.message.title,
                            body: printResult.message.body,
                        });
                    }
                }
                this.showNotification(
                    _.str.sprintf(
                        this.env._t("Successfully made a cash %s of %s."),
                        type,
                        formattedAmount
                    ),
                    3000
                );
            }
        };

    Registries.Component.extend(CashMoveButton, MyCashMoveButton);

    return CashMoveButton;
});
