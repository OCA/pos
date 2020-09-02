# © 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, fields, models
from odoo.exceptions import UserError


class WizardPosMoveReason(models.TransientModel):
    _name = 'wizard.pos.move.reason'
    _description = 'PoS Move Reasons Wizard'

    def _default_move_type(self):
        return self.env.context.get('default_move_type', 'expense')

    def _default_session_id(self):
        return self.env.context.get('active_id', False)

    _MOVE_TYPE_SELECTION = [
        ('income', 'Put Money In'),
        ('expense', 'Take Money Out'),
    ]

    move_type = fields.Selection(
        selection=_MOVE_TYPE_SELECTION, string='Move type',
        default=_default_move_type)

    move_reason_id = fields.Many2one(
        comodel_name='pos.move.reason', string='Move Reason', required=True)

    journal_id = fields.Many2one(
        comodel_name='account.journal', string="Journal",
        domain="[('id', 'in', journal_ids)]", required=True)

    session_id = fields.Many2one(
        comodel_name='pos.session', string="Current Session",
        default=_default_session_id, required=True, readonly=True)

    statement_id = fields.Many2one(
        comodel_name='account.bank.statement', string='Bank Statement',
        compute='_compute_statement_id')

    journal_ids = fields.Many2many(
        comodel_name='account.journal', related='move_reason_id.journal_ids')

    name = fields.Char(string='Reason', required=True)

    amount = fields.Float(string='Amount', required=True)

    @api.onchange('move_type')
    def onchange_move_type(self):
        if self.move_type == 'income':
            return {'domain': {
                'move_reason_id': [('is_income_reason', '=', True)]}}
        else:
            return {'domain': {
                'move_reason_id': [('is_expense_reason', '=', True)]}}

    @api.onchange('move_reason_id')
    def onchange_reason(self):
        if len(self.journal_ids) == 1:
            self.journal_id = self.journal_ids[0].id
        self.name = self.move_reason_id.name

    @api.constrains('amount')
    def _check_amount(self):
        for wizard in self.filtered(lambda x: x.amount <= 0):
            raise UserError(_("Invalid Amount"))

    @api.depends('journal_id', 'session_id')
    def _compute_statement_id(self):
        for wizard in self:
            if wizard.session_id and wizard.journal_id:
                statements = wizard.session_id.statement_ids.filtered(
                    lambda x: x.journal_id == wizard.journal_id)
                wizard.statement_id = statements and statements[0]

    @api.multi
    def apply(self):
        self.ensure_one()
        AccountBankStatementLine = self.env['account.bank.statement.line']
        AccountBankStatementLine.create(self._prepare_statement_line())

    @api.multi
    def _prepare_statement_line(self):
        self.ensure_one()
        if self.move_type == 'income':
            account = self.move_reason_id.income_account_id
            amount = self.amount
        else:
            account = self.move_reason_id.expense_account_id
            amount = - self.amount
        return {
            'date': fields.Date.context_today(self),
            'statement_id': self.statement_id.id,
            'journal_id': self.journal_id.id,
            'amount': amount,
            'account_id': account.id,
            'name': self.name,
            'ref': self.session_id.name,
        }
