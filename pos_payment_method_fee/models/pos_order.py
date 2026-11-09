from odoo import models


class PosOrder(models.Model):
    _inherit = "pos.order"

    def action_pos_order_paid(self):
        """Compute the payment fees once the order is validated.

        Draft orders (e.g. restaurant orders synchronised before payment)
        are deliberately ignored: their payments are deleted and recreated
        on every synchronisation.
        """
        res = super().action_pos_order_paid()
        fee_lines = self.payment_ids._create_payment_fee_lines()
        fee_lines.filtered(
            lambda line: line.posting_policy == "immediate"
        )._post_fee_lines()
        return res
