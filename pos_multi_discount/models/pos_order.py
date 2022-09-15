from odoo import api, fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    manual_discount = fields.Float("Manual Discount")
    manual_amount = fields.Monetary(
        "Manual Discount Rel.",
        compute="_compute_relative_discounts",
        help="Based on product price",
    )

    @api.depends("qty", "price_unit", "manual_discount")
    def _compute_relative_discounts(self):
        for rec in self:
            subtotal = rec.qty * rec.price_unit
            rec.manual_amount = subtotal * rec.manual_discount / 100
