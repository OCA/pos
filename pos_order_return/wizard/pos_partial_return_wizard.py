# Copyright 2016-2018 Sylvain LE GAL (https://twitter.com/legalsylvain)
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models
from odoo.tools import float_is_zero


class PosPartialReturnWizard(models.TransientModel):
    _name = "pos.partial.return.wizard"
    _description = "Partial Return Wizard"

    order_id = fields.Many2one(
        comodel_name="pos.order",
        string="Order to Return",
    )
    line_ids = fields.One2many(
        comodel_name="pos.partial.return.wizard.line",
        inverse_name="wizard_id",
        string="Lines to Return",
    )

    def confirm(self):
        # Set the context partial_return_wizard
        # which is used in def _prepare_refund_data(..)
        self.ensure_one()
        refund_res = self.order_id.with_context(partial_return_wizard=self).refund()

        # Unlink the lines which are not selected from the wizard or zero qty
        returned_order = self.env["pos.order"].browse(refund_res.get("res_id"))
        if returned_order.exists():
            returned_lines = self.mapped("line_ids.pos_order_line_id")
            lines = returned_order.lines.filtered(
                lambda _l, rlines=returned_lines: (
                    _l.refunded_orderline_id not in rlines
                    or float_is_zero(
                        _l.qty, precision_rounding=_l.product_uom_id.rounding
                    )
                )
            )
            if lines:
                lines.unlink()
                returned_order._compute_prices()

        return refund_res

    @api.model
    def default_get(self, fields):
        res = super().default_get(fields)
        # Check to make sure the active_model is pos.order
        if self.env.context.get("active_model") != "pos.order":
            return res

        order = self.env["pos.order"].browse(self.env.context.get("active_id"))
        if order.exists():
            line_ids = []
            for line in order.lines:
                # Don't add the line which fully returned
                if float_is_zero(
                    line.qty - line.refunded_qty,
                    precision_rounding=line.product_uom_id.rounding,
                ):
                    continue
                line_ids.append(
                    (
                        0,
                        0,
                        {
                            "pos_order_line_id": line.id,
                        },
                    )
                )
            res.update({"order_id": order.id, "line_ids": line_ids})
        return res
