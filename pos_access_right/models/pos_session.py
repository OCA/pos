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
                hasGroupDeleteOrderLine=config.group_delete_order_line_id in groups,
                hasGroupRefundAction=config.group_refund_action in groups,
                hasGroupCashinoutAction=config.group_cashinout_action in groups,
            )
        return user_vals

    def _get_pos_ui_hr_employee(self, params):
        employees = super()._get_pos_ui_hr_employee(params)
        for employee in employees:
            user = self.env["res.users"].browse(employee["user_id"])
            if user:
                groups = user.groups_id
                config = self.config_id
                employee["hasGroupPayment"] = (
                    True if config.group_payment_id in groups else False
                )

                employee["hasGroupDiscount"] = (
                    True if config.group_discount_id in groups else False
                )

                employee["hasGroupNegativeQty"] = (
                    True if config.group_negative_qty_id in groups else False
                )

                employee["hasGroupPriceControl"] = (
                    True if config.group_change_unit_price_id in groups else False
                )

                employee["hasGroupMultiOrder"] = (
                    True if config.group_multi_order_id in groups else False
                )

                employee["hasGroupDeleteOrder"] = (
                    True if config.group_delete_order_id in groups else False
                )

                employee["hasGroupDeleteOrderLine"] = (
                    True if config.group_delete_order_line_id in groups else False
                )

                employee["hasGroupRefundAction"] = (
                    True if config.group_refund_action in groups else False
                )

                employee["hasGroupCashinoutAction"] = (
                    True if config.group_cashinout_action in groups else False
                )

        return employees
