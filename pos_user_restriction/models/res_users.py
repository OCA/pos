from odoo import api, models
from odoo.tools import ormcache


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

    # HACK: To clear cache called from res.users write method
    @api.model
    @ormcache("self._uid", "group_ext_id")
    def _has_group(self, group_ext_id):
        return super()._has_group(group_ext_id)

    has_group.clear_cache = _has_group.clear_cache
