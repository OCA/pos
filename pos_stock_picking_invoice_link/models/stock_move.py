# Copyright 2019 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import fields, models


class StockMove(models.Model):
    _inherit = "stock.move"

    pos_order_line_id = fields.Many2one(
        comodel_name="pos.order.line", string="Related POS Order Line",
    )

    def create(self, vals):
        """We're creating the move in pos.order context
           so we search the line uid"""
        if self.env.context.get("merge_pos_order_line"):
            line = self.env["pos.order.line"].search([("name", "=", vals.get("name"))])
            if line:
                vals["pos_order_line_id"] = line.id
        return super().create(vals)

    def _prepare_merge_moves_distinct_fields(self):
        distinct_fields = super()._prepare_merge_moves_distinct_fields()
        distinct_fields.append("pos_order_line_id")
        return distinct_fields
