from odoo import Command, fields, models


class LoyaltyProgram(models.Model):
    _inherit = "loyalty.program"

    redeem_method = fields.Selection(
        [("discount", "Discount"), ("payment_method", "Payment Method")],
        "Redemption Method",
        required=True,
        default="discount",
        help=""
        "Payment Method: The Voucher/Gift Card is used as a payment method in PoS orders.\n"
        "Discount: The Voucher/Gift Card is used as a discount.",
    )
    pos_payment_method_ids = fields.One2many(
        "pos.payment.method",
        "program_id",
        "POS Payment Methods",
        help="Payment methods that can be used to redeem coupons of this program.",
    )

    def write(self, vals):
        if vals.get("redeem_method") == "discount":
            vals["pos_payment_method_ids"] = [Command.set([])]
        return super().write(vals)
