from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def get_closing_control_data(self):
        session = self
        if self.env.user.has_group(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        ):
            session = self.with_context(bypass_pos_user=True)
        return super(PosSession, session).get_closing_control_data()

    def close_session_from_ui(self, payment_method_closing=None):
        if payment_method_closing is None:
            payment_method_closing = {}
        session = self
        if self.env.user.has_group(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        ):
            session = self.with_context(bypass_pos_user=True)
        return super(PosSession, session).close_session_from_ui(payment_method_closing)
