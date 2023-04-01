from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _get_pos_ui_res_users(self, params):
        user_vals = super()._get_pos_ui_res_users(params)
        user_id = user_vals.get("id")
        if user_id:
            user = self.env["res.users"].browse(user_id)
            groups = user.groups_id
            config = self.config_id
            user_vals.update(
                hasGroupPayment=config.group_payment_id in groups,
                hasGroupDiscount=config.group_discount_id in groups,
                hasGroupNegativeQty=config.group_negative_qty_id in groups,
                hasGroupPriceControl=config.group_change_unit_price_id in groups,
                hasGroupMultiOrder=config.group_multi_order_id in groups,
                hasGroupDeleteOrder=config.group_delete_order_id in groups,
            )
        return user_vals
