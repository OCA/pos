# Copyright 2018-19 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import fields, models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    def create_picking(self):
        self_ctx = self.with_context(merge_pos_order_line=True)
        return super(PosOrder, self_ctx).create_picking()

    def _prepare_invoice(self):
        res = super(PosOrder, self)._prepare_invoice()
        res.update({
            'picking_ids': [(6, 0, self.picking_id.ids)],
        })
        return res

    def _action_create_invoice_line(self, line=False, invoice_id=False):
        invoice_line = super(
            PosOrder, self)._action_create_invoice_line(line, invoice_id)
        if not line:
            return invoice_line
        invoice_line.move_line_ids |= line.stock_move_ids
        return invoice_line


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    stock_move_ids = fields.One2many(
        comodel_name='stock.move',
        inverse_name='pos_order_line_id',
        string='Related Stock Moves',
    )
