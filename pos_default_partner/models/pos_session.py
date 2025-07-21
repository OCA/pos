from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _create_account_move(
        self,
        balancing_account=False,
        amount_to_balance=0,
        bank_payment_method_diffs=None,
    ):
        return super(
            PosSession,
            self.with_context(pos_default_partner_id=self.config_id.default_partner_id),
        )._create_account_move(
            balancing_account=balancing_account,
            amount_to_balance=amount_to_balance,
            bank_payment_method_diffs=bank_payment_method_diffs,
        )
