from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def action_pos_session_closing_control(self, *args, **kwargs):
        """Run standard Odoo closing and then processes
        (and posts) pending session fees whose posting policy is
        'session_close'. Does not modify any POS closing core logic."""
        res = super().action_pos_session_closing_control(*args, **kwargs)
        for session in self:
            session._process_pos_payment_method_fees()
        return res

    def _process_pos_payment_method_fees(self):
        """Batch fee generation: searches draft fee lines for this session
        with posting_policy 'session_close' and delegates to the posting
        engine (grouped or detailed per payment method)."""
        self.ensure_one()
        fee_lines = self.env["pos.payment.fee.line"].search(
            [
                ("session_id", "=", self.id),
                ("state", "=", "draft"),
                ("fee_rule_id.posting_policy", "=", "session_close"),
            ]
        )
        if fee_lines:
            fee_lines.action_post_session_close_fees()
