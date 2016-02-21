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

    max_returnable_qty = fields.Float(
        compute='_compute_max_returnable_qty', string='Returnable Quantity',
        help="Compute maximum quantity that can returned for this line,"
        " depending of the quantity of the line and other possible refunds.")

    # Compute Section
    @api.multi
    def _compute_max_returnable_qty(self):
        for line in self:
            qty = line.qty
            for refund_lines in line.refund_line_ids:
                qty += refund_lines
            line.max_returnable_qty = qty

    # Constraint Section
    @api.one
    @api.constrains('returned_line_id', 'qty')
    def _check_return_qty(self):
        if self.returned_line_id:
            if self.returned_line_id.qty > - self.qty:
                raise ValidationError(_(
                    "You can not return %d %s of %s because the original"
                    " Order line only mentions %d %s.") % (
                        self.qty, self.product_id.uom_id.name,
                        self.product_id.name, self.returned_line_id.qty,
                        self.product_id.uom_id.name))
            elif self.returned_line_id.max_returnable_qty > - self.qty:
                raise ValidationError(_(
                    "You can not return %d %s of %s because some refunds"
                    " has been yet done.\n Maximum quantity allowed :"
                    " %d %s.") % (
                        self.qty, self.product_id.uom_id.name,
                        self.product_id.name,
                        self.returned_line_id.max_returnable_qty))
        else:
            if self.qty < 0 and\
                    not self.product_id.product_tmpl_id.pos_allow_negative_qty:
                raise ValidationError(_(
                    "For legal and traceability reasons, you can not set a"
                    " negative quantity (%d %s of %s), without using return"
                    " wizard.") % (
                        self.qty, self.product_id.uom_id.name,
                        self.product_id.name))
