# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
#          Julien Weste (julien.weste@akretion.com.br)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models, api


class AccountBankStatement(models.Model):
    _inherit = 'account.bank.statement'

    total_entry_encoding_sales = fields.Monetary(
        'Sale Transactions Subtotal', compute='_compute_total_entries',
        store=True, multi='total_entries',
        help="Total of sale transaction lines.")
    total_entry_encoding_cash = fields.Monetary(
        'Cash Moves', compute='_compute_total_entries', store=True,
        multi='total_entries', help="Total of cash inputs or outputs.")

    @api.multi
    @api.depends(
        'line_ids', 'balance_start', 'line_ids.amount', 'balance_end_real')
    def _compute_total_entries(self):
        for abst in self:
            abst.total_entry_encoding_sales = sum(
                [line.amount for line in abst.line_ids
                    if line.pos_statement_id])
            abst.total_entry_encoding_cash = sum(
                [line.amount for line in abst.line_ids
                    if not line.pos_statement_id])
