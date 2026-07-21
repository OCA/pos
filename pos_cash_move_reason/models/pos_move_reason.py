# Copyright (C) 2019-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosMoveReason(models.Model):
    _name = "pos.move.reason"
    _description = "PoS - Move In / Out Reason"

    @api.model
    def _default_journal_ids(self):
        AccountJournal = self.env["account.journal"]
        journals = AccountJournal.search([("type", "=", "cash")])
        return journals.ids

    @api.model
    def _default_company_id(self):
        return self.env.user.company_id

    name = fields.Char(required=True)

    active = fields.Boolean(default=True)

    journal_ids = fields.Many2many(
        comodel_name="account.journal",
        string="Accounting Journals",
        default=_default_journal_ids,
    )

    income_account_id = fields.Many2one(
        string="Income Account", comodel_name="account.account"
    )

    expense_account_id = fields.Many2one(
        string="Expense Account", comodel_name="account.account"
    )

    company_id = fields.Many2one(
        string="Company",
        comodel_name="res.company",
        default=lambda x: x._default_company_id(),
        required=True,
    )
