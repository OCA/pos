# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, fields, models
from odoo.exceptions import UserError


class PosSession(models.Model):
    _inherit = "pos.session"

    def try_cash_in_out(self, _type, amount, reason, extras):
        sign = 1 if _type == "in" else -1
        sessions = self.filtered("cash_journal_id")
        if not sessions:
            raise UserError(_("There is no cash payment method for this PoS Session"))

        self.env["account.bank.statement.line"].create(
            [
                {
                    "journal_id": session.cash_journal_id.id,
                    "amount": sign * amount,
                    "date": fields.Date.context_today(self),
                    "payment_ref": "-".join(
                        [session.name, extras["translatedType"], reason]
                    ),
                    "statement_id": self._get_statement_id(session),
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

    def _get_statement_id(self, session):
        return (
            self.env["account.bank.statement"]
            .search(
                [
                    ("journal_id", "=", session.cash_journal_id.id),
                    ("pos_session_id", "=", session.id),
                ]
            )
            .id
        )
