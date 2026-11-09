from odoo import _, api, fields, models


class PosSession(models.Model):
    _inherit = "pos.session"

    fee_line_ids = fields.One2many(
        comodel_name="pos.payment.fee.line",
        inverse_name="session_id",
        string="Payment Fees",
    )
    fee_line_count = fields.Integer(
        compute="_compute_fee_line_count",
    )

    @api.depends("fee_line_ids")
    def _compute_fee_line_count(self):
        for session in self:
            session.fee_line_count = len(session.fee_line_ids)

    def _validate_session(
        self,
        balancing_account=False,
        amount_to_balance=0,
        bank_payment_method_diffs=None,
    ):
        """Post the pending fees once the session is really closed.

        Hooking here, rather than on the closing control action, covers every
        way of closing a session (POS UI, back-end and balancing wizard) and
        skips the attempts that end up with the balancing wizard.
        """
        res = super()._validate_session(
            balancing_account=balancing_account,
            amount_to_balance=amount_to_balance,
            bank_payment_method_diffs=bank_payment_method_diffs,
        )
        if self.state == "closed":
            self._post_payment_fees()
        return res

    def _post_payment_fees(self):
        self.ensure_one()
        self.sudo().fee_line_ids.filtered(
            lambda line: line.state in ("pending", "error")
        )._post_fee_lines()

    def action_view_fee_lines(self):
        self.ensure_one()
        action = self.env["ir.actions.actions"]._for_xml_id(
            "pos_payment_method_fee.action_pos_payment_fee_line"
        )
        action["domain"] = [("session_id", "=", self.id)]
        action["context"] = {}
        action["name"] = _("Payment Fees")
        return action
