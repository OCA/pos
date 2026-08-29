from odoo import api, models


class AccountBankStatementLine(models.Model):
    _inherit = "account.bank.statement.line"

    @api.model_create_multi
    def create(self, vals_list):
        counterpart_id = self.env.context.get("counterpart_account_id", False)
        if counterpart_id:
            for vals in vals_list:
                vals["counterpart_account_id"] = counterpart_id
        return super().create(vals_list)
