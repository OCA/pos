# Copyright (C) 2017 Creu Blanca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import _, models
from odoo.exceptions import UserError
from odoo.fields import first


class CashInvoiceOut(models.TransientModel):
    _inherit = "cash.invoice.out"

    def default_company(self, active_model, active_ids):
        if active_model == "pos.session":
            active = first(self.env[active_model].browse(active_ids))
            return active.config_id.company_id
        return super().default_company(active_model, active_ids)

    def default_currency(self, active_model, active_ids):
        if active_model == "pos.session":
            journal = self._default_journal()
            if journal.currency_id:
                return journal.currency_id
        return super().default_currency(active_model, active_ids)

    def default_journals(self, active_model, active_ids):
        if active_model == "pos.session":
            active = first(self.env[active_model].browse(active_ids))
            return self.env["account.journal"].browse(
                [r.journal_id.id for r in active.statement_ids]
            )
        return super().default_journals(active_model, active_ids)

    def run(self):
        active_model = self.env.context.get("active_model", False)
        active_ids = self.env.context.get("active_ids", False)
        if active_model == "pos.session":
            bank_statements = [
                session.statement_ids.filtered(
                    lambda r: r.journal_id.id == self.journal_id.id
                )
                for session in self.env[active_model].browse(active_ids)
            ]
            if not bank_statements:
                raise UserError(_("Bank Statement was not found"))
            return self._run(bank_statements)
        else:
            return super().run()
