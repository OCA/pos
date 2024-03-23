# Copyright (C) 2023 KMEE (http://www.kmee.com.br)
# @author: Felipe Zago Rodrigues <felipe.zago@kmee.com.br>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    plate_number = fields.Char(string="Plate Number")

    plate_number_generation = fields.Selection(
        related="config_id.plate_number_generation"
    )

    @api.model
    def _order_fields(self, ui_order):
        return {
            **super(PosOrder, self)._order_fields(ui_order),
            "plate_number": ui_order.get("plate_number"),
        }

    @api.model
    def _export_for_ui(self, order):
        return {
            **super(PosOrder, self)._export_for_ui(order),
            "plate_number": order.plate_number,
        }
