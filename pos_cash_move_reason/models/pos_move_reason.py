# Copyright (C) 2019-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, fields, models
from odoo.exceptions import UserError


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

    @api.constrains("journal_ids", "income_account_id", "expense_account_id")
    def _check_accounts(self):
        for journal in self.journal_ids:
            if self.income_account_id == journal.default_account_id:
                raise UserError(
                    _(
                        "You can't set as an income account"
                        " the account %(account_code)s - %(account_name)s"
                        " as it is the default account of the journal %(journal_name)s.",
                        account_code=self.income_account_id.code,
                        account_name=self.income_account_id.name,
                        journal_name=journal.name,
                    )
                )
            if self.expense_account_id == journal.default_account_id:
                raise UserError(
                    _(
                        "You can't set as an expense account"
                        " the account %(account_code)s - %(account_name)s"
                        " as it is the default account of the journal %(journal_name)s.",
                        account_code=self.expense_account_id.code,
                        account_name=self.expense_account_id.name,
                        journal_name=journal.name,
                    )
                )
