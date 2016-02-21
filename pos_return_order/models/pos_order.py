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

    @api.multi
    def _blank_refund(self):
        self.ensure_one()

        # Call super to use original refund algorithm (session management, ...)
        ctx = self.env.context.copy()
        ctx.update({'do_not_check_negative_qty': True})
        res = super(PosOrder, self.with_context(ctx)).refund()

        # Link Order
        original_order = self[0]
        new_order = self.browse(res['res_id'])
        new_order.returned_order_id = original_order.id

        # Remove created lines and recreate and link Lines
        new_order.lines.unlink()
        return res, new_order

    # Action Section
    @api.multi
    def refund(self):
        res, new_order = self._blank_refund()

        for line in self[0].lines:
            qty = - line.max_returnable_qty([])
            if qty != 0:
                copy_line = line.copy()
                copy_line.write({
                    'order_id': new_order.id,
                    'returned_line_id': line.id,
                    'qty': qty,
                })
        return res

    # Action Section
    @api.multi
    def partial_refund(self, partial_return_wizard):
        res, new_order = self._blank_refund()

        for wizard_line in partial_return_wizard.line_ids:
            qty = - wizard_line.qty
            if qty != 0:
                copy_line = wizard_line.pos_order_line_id.copy()
                copy_line.write({
                    'order_id': new_order.id,
                    'returned_line_id': wizard_line.pos_order_line_id.id,
                    'qty': qty,
                })
        return res
