from odoo import SUPERUSER_ID, models


class HrEmployee(models.Model):
    _inherit = "hr.employee"

    def get_barcodes_and_pin_hashed(self):
        """Edit group check"""
        res = super().get_barcodes_and_pin_hashed()
        if res:
            return res
        if not self.env.user.has_group(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        ):
            return res
        employees = self.with_env(self.env(user=SUPERUSER_ID))
        return super(HrEmployee, employees).get_barcodes_and_pin_hashed()
