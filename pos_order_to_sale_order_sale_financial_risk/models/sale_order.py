# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.model
    def create_order_from_pos(self, order_data, action):
        if "bypass_risk" in order_data:
            # Adding does not exist field in context for checking value on UI
            bypass_risk = order_data.pop("bypass_risk")
            self = self.with_context(bypass_risk=bypass_risk)
        return super(SaleOrder, self).create_order_from_pos(order_data, action)
