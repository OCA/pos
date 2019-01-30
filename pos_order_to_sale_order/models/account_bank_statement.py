# -*- coding: utf-8 -*-
#  © 2018 Akretion 
# @author Mourad EL HADJ MIMOUNE <mourad.elhadj.mimoune@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class AccountBankStatement(models.Model):
    _inherit = 'account.bank.statement'

    account_id = fields.Many2one(
        'account.account',
        related='journal_id.default_debit_account_id',
        readonly=True)


class AccountBankStatementLine(models.Model):
    _inherit = 'account.bank.statement.line'

    pos_so_statement_id = fields.Many2one(
        'sale.order', string="POS SO statement",
        ondelete='cascade')
