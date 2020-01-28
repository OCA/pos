# Copyright 2020 ForgeFlow, S.L.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class PosSession(models.Model):
    _inherit = "pos.session"

    @api.multi
    def button_update_statement_ending_balance(self):
        self.ensure_one()
        action = self.env.ref(
            "pos_statement_closing_balance."
            "action_pos_update_bank_statement_closing_balance")
        result = action.read()[0]
        return result

    @api.multi
    def _check_pos_session_bank_balance(self):
        for session in self:
            for statement in session.statement_ids:
                if statement.journal_id.pos_control_ending_balance and \
                    (statement != session.cash_register_id) and (
                        statement.balance_end != statement.balance_end_real):
                    raise ValidationError(_(
                        'Mismatch in the closing balance '
                        'for a non-cash statement.'))
        return True

    @api.multi
    def action_pos_session_closing_control(self):
        self._check_pos_session_bank_balance()
        return super(PosSession, self).action_pos_session_closing_control()
