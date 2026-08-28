# Copyright 2016-2018 Sylvain LE GAL (https://twitter.com/legalsylvain)
# Copyright 2018 David Vidal <david.vidal@tecnativa.com>
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import api, models
from odoo.exceptions import ValidationError
from odoo.tools import float_is_zero


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    @api.constrains("refunded_orderline_id", "qty", "product_id")
    def _check_return_qty(self):
        if self.env.context.get("do_not_check_negative_qty", False):
            return True
        for line in self:
            if (
                not line.refunded_orderline_id
                and line.qty < 0
                and not line.product_id.product_tmpl_id.pos_allow_negative_qty
            ):
                raise ValidationError(
                    self.env._(
                        "For legal and traceability reasons, you can not set a"
                        " negative quantity (%d %s of %s), without using "
                        "return wizard.",
                        line.qty,
                        line.product_uom_id.name,
                        line.product_id.name,
                    )
                )

    def _prepare_refund_data(self, refund_order, PosOrderLineLot):
        """
        Update the returned qty by the value input from the return wizard
        if it's less than returnable qty
        """
        data = super()._prepare_refund_data(refund_order, PosOrderLineLot)
        return_wizard = self.env.context.get("partial_return_wizard")
        if isinstance(return_wizard, self.env["pos.partial.return.wizard"].__class__):
            wizard_line = return_wizard.line_ids.filtered(
                lambda _l, order_line=self: _l.pos_order_line_id == order_line
            )
            if wizard_line:
                data = self._prepare_refund_data_partial_line(data, wizard_line[0])

        return data

    def _prepare_refund_data_partial_line(self, data, wizard_line):
        qty = 0.0
        if not float_is_zero(
            wizard_line.qty, precision_rounding=self.product_uom_id.rounding
        ):
            qty = max(data.get("qty", 0), wizard_line.qty * -1)
        data.update({"qty": qty})
        return data
