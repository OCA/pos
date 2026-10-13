from odoo import api, fields, models


class PosMakePayment(models.TransientModel):
    _inherit = "pos.make.payment"

    def _default_payment_method(self):
        active_id = self.env.context.get("active_id")
        if active_id:
            order_id = self.env["pos.order"].browse(active_id)
            credit_methods = order_id.session_id.payment_method_ids.filtered(
                lambda pm: pm.use_payment_terminal == "credit"
            )
            if credit_methods:
                return credit_methods[:1]
        return super()._default_payment_method()

    payment_method_id = fields.Many2one(default=_default_payment_method)
    is_credit = fields.Boolean(
        string="Allow to add credit for members",
        compute="_compute_is_credit",
    )

    @api.depends("payment_method_id")
    def _compute_is_credit(self):
        for rec in self:
            is_credit = False
            if (
                rec.payment_method_id
                and rec.payment_method_id.use_payment_terminal == "credit"
            ):
                is_credit = True
            rec.is_credit = is_credit
