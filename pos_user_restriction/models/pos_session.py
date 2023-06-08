from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def set_cashbox_pos(self, cashbox_value, notes):
        if self.env.user.has_group(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        ):
            self = self.with_context(bypass_pos_user=True)
        return super().set_cashbox_pos(cashbox_value, notes)

    def get_closing_control_data(self):
        if self.env.user.has_group(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        ):
            self = self.with_context(bypass_pos_user=True)
        return super().get_closing_control_data()
