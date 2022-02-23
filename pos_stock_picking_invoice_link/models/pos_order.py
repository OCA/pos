# Copyright 2018-19 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    def create_picking(self):
        self_ctx = self.with_context(merge_pos_order_line=True)
        return super(PosOrder, self_ctx).create_picking()

    def _prepare_invoice_vals(self):
        res = super()._prepare_invoice_vals()
        res.update({"picking_ids": [(6, 0, self.picking_id.ids)]})
        return res

    def _prepare_invoice_line(self, order_line):
        res = super()._prepare_invoice_line(order_line)
        res["move_line_ids"] = [(6, 0, order_line.stock_move_ids.ids)]
        return res


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    stock_move_ids = fields.One2many(
        comodel_name="stock.move",
        inverse_name="pos_order_line_id",
        string="Related Stock Moves",
    )
