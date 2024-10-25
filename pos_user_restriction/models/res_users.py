from odoo import api, models


class ResUsers(models.Model):
    _inherit = "res.users"

    @api.model
    def has_group(self, group_ext_id):
        if group_ext_id == "point_of_sale.group_pos_user" and self.env.context.get(
            "bypass_pos_user"
        ):
            return True
        else:
            res = super().has_group(group_ext_id)
        return res
