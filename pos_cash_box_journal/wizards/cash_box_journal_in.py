# Copyright 2020 Creu Blanca
# Copyright 2020 ForgeFlow, S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

from odoo import api, fields, models, _
from odoo.exceptions import UserError


class CashBoxJournalIn(models.TransientModel):
    _name = "cash.box.journal.in"
    _inherit = "cash.box.in"

    def _default_value(self, default_function):
        active_model = self.env.context.get("active_model", False)
        if active_model:
            active_ids = self.env.context.get("active_ids", False)
            return default_function(active_model, active_ids)
        return None

    def _default_company(self):
        return self._default_value(self.default_company)

    def _default_currency(self):
        return self._default_value(self.default_currency)

    def _default_journals(self):
        return self._default_value(self.default_journals)

    def _default_journal(self):
        journals = self._default_journals()
        if journals and len(journals.ids) > 0:
            return (
                self.env["account.journal"]
                .browse(journals.ids[0])
                .ensure_one()
            )

    def _default_journal_count(self):
        return len(self._default_journals().ids)

    def _default_account(self):
        return self._default_value(self.default_account)

    def _default_can_edit_account(self):
        return self._default_value(self.default_can_edit_account)

    account_id = fields.Many2one(
        "account.account",
        name="Account",
        required=True,
        default=_default_account,
    )
    can_edit_account = fields.Boolean(default=_default_can_edit_account)
    company_id = fields.Many2one(
        "res.company", default=_default_company, required=True, readonly=True
    )
    currency_id = fields.Many2one(
        "res.currency", default=_default_currency, required=True, readonly=True
    )
    journal_ids = fields.Many2many(
        "account.journal",
        default=_default_journals,
        required=True,
        readonly=True,
    )
    journal_id = fields.Many2one(
        "account.journal", required=True, default=_default_journal
    )
    journal_count = fields.Integer(
        default=_default_journal_count, readonly=True
    )

    def default_company(self, active_model, active_ids):
        if active_model == "pos.session":
            return (
                self.env[active_model]
                .browse(active_ids)[0]
                .config_id.company_id
            )
        return self.env[active_model].browse(active_ids)[0].company_id

    def default_currency(self, active_model, active_ids):
        return self.default_company(active_model, active_ids).currency_id

    def default_account(self, active_model, active_ids):
        return self.default_company(
            active_model, active_ids
        ).transfer_account_id

    def default_can_edit_account(self, active_model, active_ids):
        """ Inherit to add specific logic."""
        return False

    def default_journals(self, active_model, active_ids):
        if active_model == "pos.session":
            active = self.env[active_model].browse(active_ids)
            return self.env["account.journal"].browse(
                [r.journal_id.id for r in active.statement_ids]
            )
        return self.env[active_model].browse(active_ids)[0].journal_id

    @api.onchange("journal_ids")
    def compute_journal_count(self):
        self.journal_count = len(self.journal_ids.ids)

    @api.multi
    def _calculate_values_for_statement_line(self, record):
        res = super(
            CashBoxJournalIn, self
        )._calculate_values_for_statement_line(record)
        res["journal_id"] = self.journal_id.id
        res["account_id"] = self.account_id.id
        return res

    @api.multi
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
            return super(CashBoxJournalIn, self).run()
