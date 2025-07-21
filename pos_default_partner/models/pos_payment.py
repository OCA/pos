from odoo import models


class PosPayment(models.Model):
    _inherit = "pos.payment"

    def _generate_payment_move(self, is_reverse, change_payment=None):
        order = self.pos_order_id
        pos_session = order.session_id
        default_partner_id = pos_session.config_id.default_partner_id
        return super(
            PosPayment, self.with_context(pos_default_partner_id=default_partner_id)
        )._generate_payment_move(is_reverse, change_payment=change_payment)

    def _prepare_debit_line_payment(self, payment_move, is_reverse):
        vals = super()._prepare_debit_line_payment(payment_move, is_reverse)
        if self.env.context.get("pos_default_partner_id", False):
            default_partner_id = self.env.context["pos_default_partner_id"].id
            vals["partner_id"] = default_partner_id
        return vals
