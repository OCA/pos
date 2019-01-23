# Copyright 2016-2018 Sylvain LE GAL (https://twitter.com/legalsylvain)
# Copyright 2018 David Vidal <david.vidal@tecnativa.com>
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosOrder(models.Model):
    _inherit = 'pos.order'

    returned_order_id = fields.Many2one(
        comodel_name='pos.order',
        string='Returned Order',
        readonly=True,
    )
    refund_order_ids = fields.One2many(
        comodel_name='pos.order',
        inverse_name='returned_order_id',
        string='Refund Orders',
        readonly=True,
    )
    refund_order_qty = fields.Integer(
        compute='_compute_refund_order_qty',
        string='Refund Orders Quantity',
    )

    def _compute_refund_order_qty(self):
        order_data = self.env['pos.order'].read_group(
            [('returned_order_id', 'in', self.ids)],
            ['returned_order_id'], ['returned_order_id']
        )
        mapped_data = dict(
            [(order['returned_order_id'][0], order['returned_order_id_count'])
             for order in order_data])
        for order in self:
            order.refund_order_qty = mapped_data.get(order.id, 0)

    def _blank_refund(self, res):
        self.ensure_one()
        new_order = self.browse(res['res_id'])
        new_order.returned_order_id = self
        # Remove created lines and recreate and link Lines
        new_order.lines.unlink()
        return new_order

    def _prepare_invoice(self):
        res = super(PosOrder, self)._prepare_invoice()
        if not self.returned_order_id.invoice_id:
            return res
        res.update({
            'origin': self.returned_order_id.invoice_id.number,
            'name': _(
                'Return of %s' % self.returned_order_id.invoice_id.number),
            'refund_invoice_id': self.returned_order_id.invoice_id.id,
        })
        return res

    def _action_pos_order_invoice(self):
        """Wrap common process"""
        self.action_pos_order_invoice()
        self.invoice_id.sudo().action_invoice_open()
        self.account_move = self.invoice_id.move_id

    def refund(self):
        # Call super to use original refund algorithm (session management, ...)
        ctx = dict(self.env.context, do_not_check_negative_qty=True)
        res = super(PosOrder, self.with_context(ctx)).refund()
        new_order = self._blank_refund(res)
        for line in self.lines:
            qty = - line.max_returnable_qty([])
            if qty != 0:
                copy_line = line.copy()
                copy_line.write({
                    'order_id': new_order.id,
                    'returned_line_id': line.id,
                    'qty': qty,
                })
        return res

    def partial_refund(self, partial_return_wizard):
        ctx = dict(self.env.context, partial_refund=True)
        res = self.with_context(ctx).refund()
        new_order = self._blank_refund(res)
        for wizard_line in partial_return_wizard.line_ids:
            qty = -wizard_line.qty
            if qty != 0:
                copy_line = wizard_line.pos_order_line_id.copy()
                copy_line.write({
                    'order_id': new_order.id,
                    'returned_line_id': wizard_line.pos_order_line_id.id,
                    'qty': qty,
                })
        return res

    def action_pos_order_paid(self):
        res = super(PosOrder, self).action_pos_order_paid()
        if self.returned_order_id and self.returned_order_id.invoice_id:
            self._action_pos_order_invoice()
        return res

    def _create_picking_return(self):
        self.ensure_one()
        picking = self.returned_order_id.picking_id
        ctx = dict(self.env.context,
                   active_ids=picking.ids, active_id=picking.id)
        wizard = self.env['stock.return.picking'].with_context(ctx).create({})
        # Discard not returned lines
        wizard.product_return_moves.filtered(
            lambda x: x.product_id not in self.mapped(
                'lines.product_id')).unlink()
        to_return = {}
        for product in self.lines.mapped('product_id'):
            to_return[product] = -sum(
                self.lines.filtered(
                    lambda x: x.product_id == product).mapped('qty'))
        for move in wizard.product_return_moves:
            if to_return[move.product_id] < move.quantity:
                move.quantity = to_return[move.product_id]
            to_return[move.product_id] -= move.quantity
        return wizard

    def create_picking(self):
        """Odoo bases return picking if the quantities are negative, but it's
        not linked to the original one"""
        res = super(PosOrder, self.filtered(lambda x: not x.returned_order_id)
                    ).create_picking()
        for order in self.filtered('returned_order_id'):
            wizard = order._create_picking_return()
            res = wizard.create_returns()
            order.write({'picking_id': res['res_id']})
            order._force_picking_done(order.picking_id)
        return res


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    returned_line_id = fields.Many2one(
        comodel_name='pos.order.line',
        string='Returned Order',
        readonly=True,
    )
    refund_line_ids = fields.One2many(
        comodel_name='pos.order.line',
        inverse_name='returned_line_id',
        string='Refund Lines',
        readonly=True,
    )

    @api.model
    def max_returnable_qty(self, ignored_line_ids):
        qty = self.qty
        for refund_line in self.refund_line_ids:
            if refund_line.id not in ignored_line_ids:
                qty += refund_line.qty
        return qty

    @api.constrains('returned_line_id', 'qty')
    def _check_return_qty(self):
        if self.env.context.get('do_not_check_negative_qty', False):
            return True
        for line in self:
            if line.returned_line_id and -line.qty > line.returned_line_id.qty:
                raise ValidationError(_(
                    "You can not return %d %s of %s because the original "
                    "Order line only mentions %d %s."
                ) % (-line.qty, line.product_id.uom_id.name,
                     line.product_id.name, line.returned_line_id.qty,
                     line.product_id.uom_id.name))
            if (line.returned_line_id and
                    -line.qty >
                    line.returned_line_id.max_returnable_qty([line.id])):
                raise ValidationError(_(
                    "You can not return %d %s of %s because some refunds"
                    " have already been done.\n Maximum quantity allowed :"
                    " %d %s."
                ) % (-line.qty, line.product_id.uom_id.name,
                     line.product_id.name,
                     line.returned_line_id.max_returnable_qty([line.id]),
                     line.product_id.uom_id.name))
            if (not line.returned_line_id and
                    line.qty < 0 and not
                    line.product_id.product_tmpl_id.pos_allow_negative_qty):
                raise ValidationError(_(
                    "For legal and traceability reasons, you can not set a"
                    " negative quantity (%d %s of %s), without using "
                    "return wizard."
                ) % (line.qty, line.product_id.uom_id.name,
                     line.product_id.name))
