# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import api, models, fields, _
from odoo.exceptions import ValidationError


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    is_scrap = fields.Boolean(
        string="Is Scrap?",
        copy=False
    )

    @api.constrains('returned_line_id', 'qty')
    def _check_return_qty(self):
        if self.env.context.get('do_not_check_negative_qty', False):
            return True
        for line in self:
            if line.returned_line_id and -line.qty > line.returned_line_id.qty:
                raise ValidationError(_(
                    "You can not return %.3f %s of %s because the original "
                    "Order line only mentions %.3f %s."
                ) % (-line.qty, line.product_id.uom_id.name,
                     line.product_id.name, line.returned_line_id.qty,
                     line.product_id.uom_id.name))
            if (line.returned_line_id and
                    -line.qty >
                    line.returned_line_id.max_returnable_qty([line.id])):
                raise ValidationError(_(
                    "You can not return %.3f %s of %s because some refunds"
                    " have already been done.\n Maximum quantity allowed :"
                    " %.3f %s."
                ) % (-line.qty, line.product_id.uom_id.name,
                     line.product_id.name,
                     line.returned_line_id.max_returnable_qty([line.id]),
                     line.product_id.uom_id.name))
            if (not line.returned_line_id and
                    line.qty < 0 and not
                    line.product_id.product_tmpl_id.pos_allow_negative_qty):
                raise ValidationError(_(
                    "For legal and traceability reasons, you can not set a"
                    " negative quantity (%.3f %s of %s), without using "
                    "return wizard."
                ) % (line.qty, line.product_id.uom_id.name,
                     line.product_id.name))
