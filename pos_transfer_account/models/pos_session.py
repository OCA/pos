from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _prepare_account_bank_statement_line_vals(
        self, session, sign, amount, reason, extras
    ):
        res = super()._prepare_account_bank_statement_line_vals(
            session, sign, amount, reason, extras
        )
        if extras.get("counterpart_account_id"):
            res["counterpart_account_id"] = extras["counterpart_account_id"]
        return res

    def try_cash_in_out(self, _type, amount, reason, extras):
        extras = extras or {}
        if self.config_id.suspense_account_id:
            counterpart_account = self.config_id.suspense_account_id
        else:
            counterpart_account = self.config_id.company_id.transfer_account_id
        extras["counterpart_account_id"] = counterpart_account.id
        return super().try_cash_in_out(_type, amount, reason, extras)

    def show_cash_register(self):
        action = super().show_cash_register()
        if self.config_id.suspense_account_id:
            counterpart_account = self.config_id.suspense_account_id
        else:
            counterpart_account = self.config_id.company_id.transfer_account_id
        action["context"] = {
            "default_pos_session_id": self.id,
            "counterpart_account_id": counterpart_account.id,
            "default_journal_id": self.cash_journal_id.id,
        }
        return action
