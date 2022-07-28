# Copyright (C) 2019-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


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
        action["context"] = {"default_move_type": move_type}
        return action
