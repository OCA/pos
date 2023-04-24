from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

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

        return employees
