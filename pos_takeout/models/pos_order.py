# Copyright 2023 KMEE INFORMATICA LTDA (http://www.kmee.com.br).
# @author: Felipe Zago Rodrigues <felipe.zago@kmee.com.br>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    eat_here = fields.Boolean(string="Is the customer eating here", default=True)

    @api.model
    def _order_fields(self, ui_order):
        return {
            **super(PosOrder, self)._order_fields(ui_order),
            "eat_here": ui_order.get("eat_here"),
        }

    def _export_for_ui(self, order):
        return {
            **super(PosOrder, self)._export_for_ui(order),
            "eat_here": order.eat_here,
        }
