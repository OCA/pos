# Copyright 2025 Binhex - Adasat Torres de León.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from datetime import datetime

from odoo import api, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.model
    def _prepare_from_pos(self, order_data):
        order_vals = super()._prepare_from_pos(order_data)
        if order_data.get("commitment_date", False):
            datetime_obj = datetime.strptime(
                order_data["commitment_date"], "%Y-%m-%dT%H:%M:%S.%fZ"
            )
            order_vals["commitment_date"] = datetime_obj
        return order_vals
