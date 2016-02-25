# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from openerp import fields, models, api
from openerp.exceptions import ValidationError
from openerp.tools.translate import _


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    # Column Section
    returned_line_id = fields.Many2one(
        comodel_name='pos.order.line', string='Returned Order',
        readonly=True)

    refund_line_ids = fields.One2many(
        comodel_name='pos.order.line', inverse_name='returned_line_id',
        string='Refund Lines', readonly=True)

    # Compute Section
    @api.model
    def max_returnable_qty(self, ignored_line_ids):
        qty = self.qty
        for refund_line in self.refund_line_ids:
            if refund_line.id not in ignored_line_ids:
                qty += refund_line.qty
        return qty

    # Constraint Section
    @api.one
    @api.constrains('returned_line_id', 'qty')
    def _check_return_qty(self):
        if self.env.context.get('do_not_check_negative_qty', False):
            return True
        if self.returned_line_id:
            if - self.qty > self.returned_line_id.qty:
                raise ValidationError(_(
                    "You can not return %d %s of %s because the original"
                    " Order line only mentions %d %s.") % (
                        - self.qty, self.product_id.uom_id.name,
                        self.product_id.name, self.returned_line_id.qty,
                        self.product_id.uom_id.name))
            elif - self.qty >\
                    self.returned_line_id.max_returnable_qty([self.id]):
                raise ValidationError(_(
                    "You can not return %d %s of %s because some refunds"
                    " has been yet done.\n Maximum quantity allowed :"
                    " %d %s.") % (
                        - self.qty, self.product_id.uom_id.name,
                        self.product_id.name,
                        self.returned_line_id.max_returnable_qty([self.id]),
                        self.product_id.uom_id.name))
        else:
            if self.qty < 0 and\
                    not self.product_id.product_tmpl_id.pos_allow_negative_qty:
                raise ValidationError(_(
                    "For legal and traceability reasons, you can not set a"
                    " negative quantity (%d %s of %s), without using return"
                    " wizard.") % (
                        self.qty, self.product_id.uom_id.name,
                        self.product_id.name))
