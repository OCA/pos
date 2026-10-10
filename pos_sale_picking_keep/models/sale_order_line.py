# Copyright 2026 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import models


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    def _compute_qty_delivered(self):
        res = super()._compute_qty_delivered()

        # Mimic what is done at pos_sale level but lowering the quantity
        # TODO: Delete if merged https://github.com/odoo/odoo/pull/253333
        def update_qty_delivered_from_pickings(sale_line, pos_lines):
            if all(
                picking.state == "done" for picking in pos_lines.order_id.picking_ids
            ):
                sale_line.qty_delivered -= sum(
                    (
                        self._convert_qty(sale_line, pos_line.qty, "p2s")
                        for pos_line in pos_lines
                        if sale_line.product_id.type != "service"
                    ),
                    0,
                )

        for sale_line in self:
            if sale_line.pos_order_line_ids.order_id.config_id.keep_picking:
                pos_lines = sale_line.pos_order_line_ids.filtered(
                    lambda order_line: order_line.order_id.state
                    not in ["cancel", "draft"]
                )
                update_qty_delivered_from_pickings(sale_line, pos_lines)

                refund_lines = (
                    sale_line.pos_order_line_ids.refund_orderline_ids.filtered(
                        lambda order_line: order_line.order_id.state
                        not in ["cancel", "draft"]
                    )
                )
                update_qty_delivered_from_pickings(sale_line, refund_lines)
        return res
