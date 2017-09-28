# -*- coding: utf-8 -*-
# Copyright (C) 2017 Creu Blanca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import api, fields, models


class AccountBankStatementLine(models.Model):
    _inherit = 'account.bank.statement.line'

    invoice_id = fields.Many2one(
        'account.invoice',
        string='Invoice',
        readonly=True
    )

    @api.multi
    def fast_counterpart_creation(self):
        for st_line in self:
            if not st_line.invoice_id:
                super(
                    AccountBankStatementLine, st_line
                ).fast_counterpart_creation()
            else:
                invoice = st_line.invoice_id
                move_line = invoice.move_id.line_ids.filtered(
                    lambda r: r.account_id.id == invoice.account_id.id
                )
                vals = {
                    'name': st_line.name,
                    'debit': st_line.amount < 0 and -st_line.amount or 0.0,
                    'credit': st_line.amount > 0 and st_line.amount or 0.0,
                    'move_line': move_line
                }
                st_line.process_reconciliation(counterpart_aml_dicts=[vals])
