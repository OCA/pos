from odoo import models
from odoo.exceptions import AccessError


class PosSession(models.Model):
    _inherit = "pos.session"

    def get_closing_control_data(self):
        """Close the session if group_assigned"""
        try:
            return super().get_closing_control_data()
        except AccessError:
            if self.env.user.has_group(
                "pos_user_restriction.group_assigned_points_of_sale_user"
            ):
                result = super(
                    PosSession, self.with_user(self.env.ref("base.user_admin"))
                ).get_closing_control_data()
                result[
                    "is_manager"
                ] = False  # set this to false, as user is not a manager
                return result
            raise
