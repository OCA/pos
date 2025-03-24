from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def get_closing_control_data(self):
        if self.env.user.has_group(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        ):
            self = self.with_context(bypass_pos_user=True)
        return super().get_closing_control_data()

    def _validate_session(
        self,
        balancing_account=False,
        amount_to_balance=0,
        bank_payment_method_diffs=None,
    ):
        if self.env.user.has_group(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        ):
            self = self.with_context(bypass_pos_user=True)
        return super()._validate_session(
            balancing_account, amount_to_balance, bank_payment_method_diffs
        )
