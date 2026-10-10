/*
Copyright (C) 2026-Today: GRAP (https://www.grap.coop)
@author: Quentin DUPONT
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define("pos_cash_move_reason.CashMovePopupPatch", function (require) {
    "use strict";

    const CashMovePopup = require("point_of_sale.CashMovePopup");
    const {patch} = require("web.utils");
    const {useState} = owl;
    const Registries = require("point_of_sale.Registries");
    const {isConnectionError} = require("point_of_sale.utils");

    patch(CashMovePopup.prototype, "pos_cash_move_reason.CashMovePopupPatch", {
        setup() {
            this._super(...arguments);
            this.state = useState({
                ...this.state,
                inputMoveReason: "",
                inputMoveReasonFiltered: "",
                inputMoveReasonJournal: "",
                inputMoveReasonJournalFiltered: [],
            });
        },
        onClickMoveReason(reason_id) {
            this.state.inputMoveReason = reason_id;
            this.state.inputMoveReasonJournal = "";

            /* Get Journals linked to Move Reason*/
            const reason = this.env.pos.pos_move_reason.find((r) => r.id === reason_id);

            this.state.inputMoveReasonJournalFiltered = reason.journal_ids;
        },
        onClickMoveReasonJournal(journal_id) {
            this.state.inputMoveReasonJournal = journal_id;
        },

        /*
         * Core function for choice IN or OUT
         * Reset all choice if user change this
         */
        onClickButton(type) {
            this.state.inputMoveReason = "";
            this.state.inputMoveReasonJournal = "";
            this.state.inputMoveReasonJournalFiltered = [];
            return this._super(type);
        },

        /* Filter Move Reasons according to cash IN or OUT*/
        get filteredMoveReasons() {
            let res = [];
            if (this.state.inputType === "in") {
                res = this.env.pos.pos_move_reason.filter(
                    (reason) => reason.income_account_id !== false
                );
            } else if (this.state.inputType === "out") {
                res = this.env.pos.pos_move_reason.filter(
                    (reason) => reason.expense_account_id !== false
                );
            }
            return res;
        },

        /* Filter Account Jounal according to Move Reason chosen + POS Payment Journals */
        get filteredJournals() {
            const journal_ids = this.state.inputMoveReasonJournalFiltered;

            /* Pm = payment_methods ids of THIS session */
            const session_pm_ids = this.env.pos.pos_session.payment_method_ids;

            /* Get payment_methods object (contain account journal) */
            const session_payment_methods = this.env.pos.payment_methods.filter((pm) =>
                session_pm_ids.includes(pm.id)
            );

            /* Get journal */
            const pos_journal_ids = session_payment_methods
                .map((pm) => pm.journal_id[0])
                .filter((id) => id);

            /* Filter journal with move reason journal + session */
            const res = this.env.pos.account_journal.filter(
                (j) => journal_ids.includes(j.id) && pos_journal_ids.includes(j.id)
            );

            /* Choose journal if there is just one*/
            if (res.length === 1) {
                this.state.inputMoveReasonJournal = res[0].id;
            }

            return res;
        },

        /* Return new fields for popup result, to create bank statement with them */
        getPayload() {
            const payload = this._super(...arguments);

            return {
                ...payload,
                move_reason: this.state.inputMoveReason,
                journal_id: this.state.inputMoveReasonJournal,
            };
        },

        /* Add new required fields and handle link with Close PopUp*/
        async confirm(goToClosePopup) {
            if (this.state.inputMoveReason === "") {
                this.state.inputHasError = true;
                this.errorMessage = this.env._t("Select one Reason before confirming.");
                return false;
            }
            if (
                this.state.inputMoveReasonJournalFiltered.length > 0 &&
                this.state.inputMoveReasonJournal === ""
            ) {
                this.state.inputHasError = true;
                this.errorMessage = this.env._t(
                    "Select one Journal before confirming."
                );
                return false;
            }
            this._super(...arguments);

            /* If option, show ClosePop */
            /* Code in inspired by core code */
            if (goToClosePopup === "goToClosePopup") {
                // Wait for less than a second in order to have the new Move Reason in database.
                await new Promise((res) => setTimeout(res, 300));

                try {
                    const info = await this.env.pos.getClosePosInfo();
                    this.showPopup("ClosePosPopup", {info: info, keepBehind: true});
                } catch (e) {
                    if (isConnectionError(e)) {
                        this.showPopup("OfflineErrorPopup", {
                            title: this.env._t("Network Error"),
                            body: this.env._t(
                                "Please check your internet connection and try again."
                            ),
                        });
                    } else {
                        this.showPopup("ErrorPopup", {
                            title: this.env._t("Unknown Error"),
                            body: this.env._t(
                                "An unknown error prevents us from getting closing information."
                            ),
                        });
                    }
                }
            }

            return true;
        },

        cancel() {
            this._super(...arguments);
        },
    });

    Registries.Component.add(CashMovePopup);
    return CashMovePopup;
});
