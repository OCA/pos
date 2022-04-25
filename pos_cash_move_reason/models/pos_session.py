# Copyright (C) 2019-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosSession(models.Model):
    _inherit = 'pos.session'

    display_move_reason_income = fields.Boolean(
        compute='_compute_display_move_reason')

    display_move_reason_expense = fields.Boolean(
        compute='_compute_display_move_reason')

    move_reason_statement_line_ids = fields.One2many(
        string="Cash Moves",
        comodel_name="account.bank.statement.line",
        compute="_compute_move_reason_statement_ids")

    move_reason_statement_line_qty = fields.Integer(
        string="Cash Moves Quantity",
        compute="_compute_move_reason_statement_ids")

    @api.multi
    def _compute_display_move_reason(self):
        MoveReason = self.env['pos.move.reason']
        for session in self:
            # Get all reasons
            reasons = MoveReason.search([
                ('company_id', '=', session.config_id.company_id.id)])
            session.display_move_reason_income = len(
                reasons.filtered(lambda x: x.is_income_reason))
            session.display_move_reason_expense = len(
                reasons.filtered(lambda x: x.is_expense_reason))

    @api.depends("statement_ids.line_ids")
    def _compute_move_reason_statement_ids(self):
        for session in self:
            session.move_reason_statement_line_ids = [
                (4, line.id) for line in session.mapped(
                    "statement_ids.line_ids"
                ).filtered(lambda x: not x.pos_statement_id)
            ]
            session.move_reason_statement_line_qty = len(
                session.move_reason_statement_line_ids
            )

    def button_move_income(self):
        return self._button_move_reason('income')

    def button_move_expense(self):
        return self._button_move_reason('expense')

    def _button_move_reason(self, move_type):
        action = self.env.ref(
            'pos_cash_move_reason.action_wizard_pos_move_reason').read()[0]
        action['context'] = {'default_move_type': move_type}
        return action
