# Copyright 2016-2018 Sylvain LE GAL (https://twitter.com/legalsylvain)
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models
from odoo.exceptions import ValidationError
from odoo.tools import float_is_zero


class PosPartialReturnWizardLine(models.TransientModel):
    _name = "pos.partial.return.wizard.line"
    _description = "Partial Return Wizard Line"

    wizard_id = fields.Many2one(
        comodel_name="pos.partial.return.wizard",
        string="Wizard",
    )
    pos_order_line_id = fields.Many2one(
        comodel_name="pos.order.line",
        required=True,
        readonly=True,
        string="Line To Return",
    )
    initial_qty = fields.Float(
        string="Initial Quantity",
        digits="Product Unit of Measure",
        help="Quantity of Product initially sold",
        related="pos_order_line_id.qty",
    )
    max_returnable_qty = fields.Float(
        string="Returnable Quantity",
        digits="Product Unit of Measure",
        help="Compute maximum quantity that can be returned for this line, "
        "depending of the quantity of the line and other possible "
        "refunds.",
        compute="_compute_max_returnable_qty",
    )
    qty = fields.Float(
        string="Returned Quantity",
        digits="Product Unit of Measure",
    )

    @api.depends("pos_order_line_id")
    def _compute_max_returnable_qty(self):
        for line in self:
            order_line = line.pos_order_line_id
            line.max_returnable_qty = order_line.qty - order_line.refunded_qty

    @api.constrains("pos_order_line_id", "qty")
    def _check_return_qty(self):
        for line in self:
            order_line = line.pos_order_line_id
            if float_is_zero(
                line.qty, precision_rounding=order_line.product_uom_id.rounding
            ):
                continue

            if line.qty > line.initial_qty:
                raise ValidationError(
                    self.env._(
                        "You can not return %d %s of %s because the original "
                        "Order line only mentions %d %s.",
                        line.qty,
                        order_line.product_uom_id.name,
                        order_line.product_id.name,
                        line.initial_qty,
                        order_line.product_uom_id.name,
                    )
                )
            if line.qty > line.max_returnable_qty:
                raise ValidationError(
                    self.env._(
                        "You can not return %d %s of %s because some refunds"
                        " have already been done.\n Maximum quantity allowed :"
                        " %d %s.",
                        line.qty,
                        order_line.product_uom_id.name,
                        order_line.product_id.name,
                        line.max_returnable_qty,
                        order_line.product_uom_id.name,
                    )
                )
