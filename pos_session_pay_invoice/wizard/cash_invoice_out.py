# -*- coding: utf-8 -*-
# Copyright (C) 2017 Creu Blanca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import api, models, _
from odoo.exceptions import UserError


class CashInvoiceOut(models.TransientModel):
    _inherit = 'cash.invoice.out'

    def default_company(self, active_model, active_ids):
        if active_model == 'pos.session':
            active = self.env[active_model].browse(active_ids)
            return active[0].config_id.company_id
        return super(CashInvoiceOut, self).default_company(
            active_model, active_ids
        )

    def default_currency(self, active_model, active_ids):
        if active_model == 'pos.session':
            journal = self._default_journal()
            if journal.currency_id:
                return journal.currency_id
        return super(CashInvoiceOut, self).default_currency(
            active_model, active_ids
        )

    def default_journals(self, active_model, active_ids):
        if active_model == 'pos.session':
            active = self.env[active_model].browse(active_ids)
            return self.env['account.journal'].browse(
                [r.journal_id.id for r in active.statement_ids])
        return super(CashInvoiceOut, self).default_journals(
            active_model, active_ids
        )

    @api.multi
    def run(self):
        active_model = self.env.context.get('active_model', False)
        active_ids = self.env.context.get('active_ids', False)
        if active_model == 'pos.session':
            bank_statements = [
                session.statement_ids.filtered(
                    lambda r: r.journal_id.id == self.journal_id.id
                )
                for session in self.env[active_model].browse(active_ids)
            ]
            if not bank_statements:
                raise UserError(_('Bank Statement was not found'))
            return self._run(bank_statements)
        else:
            return super(CashInvoiceOut, self).run()
