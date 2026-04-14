# Copyright (C) 2019-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, fields, models
from odoo.exceptions import UserError


class PosSession(models.Model):
    _inherit = "pos.session"

    display_move_reason_income = fields.Boolean(compute="_compute_display_move_reason")

    display_move_reason_expense = fields.Boolean(compute="_compute_display_move_reason")

    def _compute_display_move_reason(self):
        MoveReason = self.env["pos.move.reason"]
        all_reasons = MoveReason.search(
            [("company_id", "in", self.mapped("config_id.company_id").ids)]
        )
        for session in self:
            # Get all reasons
            reasons = all_reasons.filtered_domain(
                [("company_id", "=", session.config_id.company_id.id)]
            )
            session.display_move_reason_income = len(
                reasons.filtered(lambda x: x.is_income_reason)
            )
            session.display_move_reason_expense = len(
                reasons.filtered(lambda x: x.is_expense_reason)
            )

    def button_move_income(self):
        return self._button_move_reason("income")

    def button_move_expense(self):
        return self._button_move_reason("expense")

    def _button_move_reason(self, move_type):
        action = (
            self.env.ref("pos_cash_move_reason.action_wizard_pos_move_reason")
            .sudo()
            .read()[0]
        )
        action["context"] = {
            "default_move_type": move_type,
        }
        return action

    # Add _get_pos_ui_ and _loader_params_ for each model
    # For pos_move_reason
    def _get_pos_ui_pos_move_reason(self, params):
        return self.env["pos.move.reason"].search_read(**params["search_params"])

    def _loader_params_pos_move_reason(self):
        return {
            "search_params": {
                "fields": [
                    "name",
                    "journal_ids",
                    "is_income_reason",
                    "is_expense_reason",
                ],
            },
        }

    # For account journal
    def _get_pos_ui_account_journal(self, params):
        return self.env["account.journal"].search_read(**params["search_params"])

    def _loader_params_account_journal(self):
        return {
            "search_params": {
                "fields": ["name"],
            },
        }

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        result.append("pos.move.reason")
        result.append("account.journal")
        return result

    # Rewrite it to handle several journals for pos_cash_move_reason
    # Inspired by core code from Odoo SA
    # add "move_reason" and "journal_id" in dict extras
    def try_cash_in_out(self, _type, amount, reason, extras):
        sign = 1 if _type == "in" else -1
        sessions = self.filtered("cash_journal_id")
        if not sessions:
            raise UserError(_("There is no cash payment method for this PoS Session"))

        # Handle move_reason
        move_reason = self.env["pos.move.reason"].browse(extras["move_reason"])
        journal = self.env["account.journal"].browse(extras["journal_id"])

        # Handle account
        if _type == "in":
            account_id = move_reason.income_account_id.id
        else:
            account_id = move_reason.expense_account_id.id

        self.env["account.bank.statement.line"].sudo().create(
            [
                {
                    "pos_session_id": session.id,
                    "journal_id": journal.id or session.cash_journal_id.id,
                    "amount": sign * amount,
                    "date": fields.Date.context_today(self),
                    "payment_ref": "-".join(
                        [session.name, extras["translatedType"], reason]
                    ),
                    "counterpart_account_id": account_id,
                }
                for session in sessions
            ]
        )

        message_content = [
            f"Cash {extras['translatedType']}",
            f'- Amount: {extras["formattedAmount"]}',
        ]
        if reason:
            message_content.append(f"- Reason: {reason}")
        self.message_post(body="<br/>\n".join(message_content))
