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
                    (reason) => reason.is_income_reason === true
                );
            } else if (this.state.inputType === "out") {
                res = this.env.pos.pos_move_reason.filter(
                    (reason) => reason.is_expense_reason === true
                );
            }
            return res;
        },

        /* Filter Account Jounal according to Move Reason chosen*/
        get filteredJournals() {
            const ids = this.state.inputMoveReasonJournalFiltered;

            const res = this.env.pos.account_journal.filter((j) => ids.includes(j.id));

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

        /* Add new required fields */
        confirm() {
            if (this.state.inputMoveReason === "") {
                this.state.inputHasError = true;
                this.errorMessage = this.env._t("Select one Reason before confirming.");
                return;
            }
            if (
                this.state.inputMoveReasonJournalFiltered.length > 0 &&
                this.state.inputMoveReasonJournal === ""
            ) {
                this.state.inputHasError = true;
                this.errorMessage = this.env._t(
                    "Select one Journal before confirming."
                );
                return;
            }
            return this._super(...arguments);
        },
    });

    Registries.Component.add(CashMovePopup);
    return CashMovePopup;
});
