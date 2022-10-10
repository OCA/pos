odoo.define("pos_cash_control.CashMoveButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const {_t} = require("web.core");

    const TRANSLATED_CASH_MOVE_TYPE = {
        in: _t("in"),
        out: _t("out"),
    };

    class CashMoveButton extends PosComponent {
        async onClick() {
            const {confirmed, payload} = await this.showPopup("CashMovePopup", {
                cancelText: _t("Cancel"),
                title: _t("Cash In/Out"),
            });
            if (!confirmed) return;
            const {type, amount, reason} = payload;
            const translatedType = TRANSLATED_CASH_MOVE_TYPE[type];
            const formattedAmount = this.env.pos.format_currency(amount);
            if (!amount) {
                return this.showPopup("ErrorPopup", {
                    title: this.env._t("Not amount"),
                    body: _.str.sprintf(
                        this.env._t("Cash in/out of %s is ignored."),
                        formattedAmount
                    ),
                });
            }
            const extras = {formattedAmount, translatedType};
            await this.rpc({
                model: "pos.session",
                method: "try_cash_in_out",
                args: [[this.env.pos.pos_session.id], type, amount, reason, extras],
            });
            this.showPopup("ConfirmPopup", {
                body: _.str.sprintf(
                    this.env._t("Successfully made a cash %s of %s."),
                    type,
                    formattedAmount
                ),
            });
        }
    }
    CashMoveButton.template = "CashMoveButton";

    Registries.Component.add(CashMoveButton);

    return CashMoveButton;
});
