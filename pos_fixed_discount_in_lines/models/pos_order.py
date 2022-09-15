from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    total_fixed_discount = fields.Float("Fixed Discount", readonly=True)

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        res["total_fixed_discount"] = ui_order.get("total_fixed_discount")
        return res


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    fixed_discount = fields.Float("Fixed Discount")
    fixed_discount_relative = fields.Float(
        "Fixed Discount Rel.", help="Based on product price"
    )
    fixed_discount_relative_amount = fields.Monetary(
        "Fixed Discount Rel. Amount", help="Based on product price"
    )

    @api.depends("qty", "price_unit", "manual_discount", "fixed_discount")
    def _compute_relative_discounts(self):
        super(PosOrderLine, self)._compute_relative_discounts()
        for rec in self:
            rec.fixed_discount_relative_amount = (
                rec.qty * rec.price_unit - rec.manual_amount
            ) - rec.price_subtotal
            rec.fixed_discount_relative = (
                100 * rec.fixed_discount_relative_amount / (rec.qty * rec.price_unit)
            )
