from odoo import fields, models


class PosPayment(models.Model):
    _inherit = "pos.payment"

    coupon_id = fields.Many2one(
        "loyalty.card",
        "Coupon",
        ondelete="restrict",
        help="The coupon used as payment method.",
    )

    def _export_for_ui(self, payment):
        result = super()._export_for_ui(payment)
        result["code"] = payment.coupon_id.code
        return result
