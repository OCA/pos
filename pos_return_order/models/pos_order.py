# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from openerp import fields, models, api
from openerp.addons import decimal_precision as dp


class PosOrder(models.Model):
    _inherit = 'pos.order'

    # Column Section
    returned_order_id = fields.Many2one(
        comodel_name='pos.order', string='Returned Order', readonly=True)

    refund_order_ids = fields.One2many(
        comodel_name='pos.order', inverse_name='returned_order_id',
        string='Refund Orders', readonly=True)

    refund_order_qty = fields.Integer(
        compute='_compute_refund_order_qty', string='Refund Orders Quantity',
        digits=dp.get_precision('Product Unit of Measure'))

    # Compute Section
    @api.multi
    def _compute_refund_order_qty(self):
        for order in self:
            order.refund_order_qty = len(order.refund_order_ids)

    # Action Section
    @api.multi
    def refund(self):
        self.ensure_one()

        # Call super to use original refund algorithm (session management, ...)
        res = super(PosOrder, self).refund()

        # Link Order
        original_order = self[0]
        new_order = self.browse(res['res_id'])
        new_order.returned_order_id = original_order.id

        # Remove created lines and recreate and link Lines
        new_order.lines.unlink()
        for line in original_order.lines:
            qty = - line.max_returnable_qty
            if qty != 0:
                copy_line = line.copy()
                copy_line.write({
                    'order_id': new_order.id,
                    'returned_line_id': line.id,
                    'qty': qty,
                })
        return res
