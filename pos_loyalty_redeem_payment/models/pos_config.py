from odoo import _, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    allow_auto_print_giftcard = fields.Boolean(default=True)

    def _get_program_ids(self):
        ret = super()._get_program_ids()
        if self.env.context.get("payment_method_id"):
            return self.env["loyalty.program"].search(
                [
                    ("id", "in", ret.ids),
                    ("program_type", "=", "gift_card"),
                    ("redeem_method", "=", "payment_method"),
                    (
                        "pos_payment_method_ids",
                        "in",
                        self.env.context.get("payment_method_id"),
                    ),
                ]
            )
        return ret

    def use_coupon_code(self, code, *args):
        ret = super().use_coupon_code(code, *args)
        if self.env.context.get("payment_method_id"):
            return ret
        program_id = ret.get("payload", {}).get("program_id")
        if not program_id:
            return ret
        program = self.env["loyalty.program"].browse(program_id)
        if (
            program.program_type == "gift_card"
            and program.redeem_method == "payment_method"
        ):
            return {
                "successful": False,
                "payload": {
                    "error_message": _(
                        "This coupon has to be redeemed from payment mode (%s).", code
                    ),
                },
            }
        return ret
