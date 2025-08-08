# Copyright 2025 APSL-Nagarro Antoni Marroig
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class RMA(models.Model):
    _inherit = "rma"

    pos_order_id = fields.Many2one(comodel_name="pos.order")

    @api.model
    def create_rma_from_pos(self, pos_order_line_id, qty, note):
        line = self.env["pos.order.line"].browse(pos_order_line_id)
        rma_vals = {
            "partner_id": line.order_id.partner_id.id,
            "date": fields.Datetime.now(),
            "product_id": line.product_id.id,
            "product_uom_qty": qty,
            "description": note,
            "pos_order_id": line.order_id.id,
            "user_id": self.env.user.id,
        }
        return self.create(rma_vals)

    @api.model
    def check_can_create_rma(self, line_id):
        pos_order_line = self.env["pos.order.line"].browse(line_id)
        rmas = self.search(
            [
                ("product_id", "=", pos_order_line.product_id.id),
                ("pos_order_id", "=", pos_order_line.order_id.id),
            ],
        )
        total_rma_qty = sum(rmas.mapped("product_uom_qty"))
        return bool(
            (rmas and total_rma_qty < pos_order_line.qty)
            or (
                not rmas
                and pos_order_line.product_id.detailed_type in ["consu", "product"]
            )
        )
