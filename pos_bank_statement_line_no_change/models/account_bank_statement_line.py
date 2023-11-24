# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, models
from odoo.exceptions import UserError


class AccountBankStatementLine(models.Model):
    _inherit = "account.bank.statement.line"

    _POS_PROTECTED_FIELDS = [
        "amount",
        "partner_id",
    ]

    @api.multi
    def write(self, vals):
        if (self.filtered(
            lambda x: x.pos_statement_id.state in ["paid", "done", "invoiced"]
        ) and set(vals.keys()).intersection(self._POS_PROTECTED_FIELDS)):
            raise UserError(_(
                "You can not alter bank statement lines that are related"
                " to orders in paid, done or invoiced state."))
        return super().write(vals)

    @api.multi
    def unlink(self):
        if self.filtered(
            lambda x: x.pos_statement_id.state in ["paid", "done", "invoiced"]
        ):
            raise UserError(_(
                "You can not unlink bank statement lines that are related"
                " to orders in paid, done or invoiced state."))
        return super().unlink()
