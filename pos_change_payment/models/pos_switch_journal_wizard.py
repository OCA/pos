# coding: utf-8
# Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, fields, models


class PosSwitchJournalWizard(models.TransientModel):
    _name = 'pos.switch.journal.wizard'

    order_id = fields.Many2one(
        comodel_name='pos.order', string='PoS Order',
        required=True, readonly=True)

    statement_line_id = fields.Many2one(
        comodel_name='account.bank.statement.line', string='Statement',
        required=True, readonly=True)

    old_journal_id = fields.Many2one(
        comodel_name='account.journal', string='Old Journal',
        required=True, readonly=True)

    new_journal_id = fields.Many2one(
        comodel_name='account.journal', string='New Journal',
        required=True, domain=lambda s: s._domain_new_journal_id())

    amount = fields.Float(string='Amount', readonly=True)

    @api.model
    def _domain_new_journal_id(self):
        AccountBankStatementLine = self.env['account.bank.statement.line']
        statement_line = AccountBankStatementLine.browse(
            self.env.context.get('active_id'))
        return [(
            'id', 'in',
            statement_line.pos_statement_id.session_id.journal_ids.ids)]

    @api.model
    def default_get(self, fields):
        AccountBankStatementLine = self.env['account.bank.statement.line']
        res = super(PosSwitchJournalWizard, self).default_get(fields)
        statement_line = AccountBankStatementLine.browse(
            self.env.context.get('active_id'))
        res.update({'statement_line_id': statement_line.id})
        res.update({'order_id': statement_line.pos_statement_id.id})
        res.update({'old_journal_id': statement_line.journal_id.id})
        res.update({'amount': statement_line.amount})
        return res

    # Action section
    @api.multi
    def button_switch_journal(self):
        self.ensure_one()
        # Check if changing payment is allowed
        self.order_id._allow_change_payments()

        # TODO (FIXME) when upstream is fixed.
        # We do 2 write, one in the old statement, one in the new, with
        # 'amount' value each time to recompute all the functional fields
        # of the Account Bank Statements
        amount = self.amount
        self.statement_line_id.with_context(change_pos_payment=True).write({
            'amount': 0.0,
        })

        # Change statement of the statement line
        new_statement = self.order_id.session_id.statement_ids.filtered(
            lambda x: x.journal_id == self.new_journal_id)[0]
        self.statement_line_id.with_context(change_pos_payment=True).write({
            'amount': amount,
            'statement_id': new_statement.id,
        })

        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }
