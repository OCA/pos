from odoo import api, fields, models
from odoo.tools import float_is_zero


class PosPayment(models.Model):
    _inherit = "pos.payment"

    fee_line_ids = fields.One2many(
        comodel_name="pos.payment.fee.line",
        inverse_name="payment_id",
        string="Fee Lines",
    )

    total_fee_amount = fields.Monetary(
        string="Total Fees",
        compute="_compute_total_fee_amount",
        store=True,
    )

    @api.depends("fee_line_ids.fee_amount")
    def _compute_total_fee_amount(self):
        for payment in self:
            payment.total_fee_amount = sum(payment.fee_line_ids.mapped("fee_amount"))

    @api.model_create_multi
    def create(self, vals_list):
        payments = super().create(vals_list)
        payments._create_payment_method_fees()
        return payments

    def _create_payment_method_fees(self):
        """Fee engine entry point: evaluate every active fee rule
        configured on the payment's method and generate the corresponding
        ``pos.payment.fee.line`` records. This never touches the ticket,
        the order amounts or the taxes: fees act exclusively as an
        internal financial cost."""
        FeeLine = self.env["pos.payment.fee.line"]
        for payment in self:
            payment_method = payment.payment_method_id
            if not payment_method or not payment_method.fee_ids:
                continue
            session = payment.session_id
            if not session:
                continue
            precision = payment.currency_id.decimal_places if payment.currency_id else 2
            for fee_rule in payment_method.fee_ids.filtered(lambda f: f.active):
                fee_amount = fee_rule._compute_fee_amount(payment.amount)
                if float_is_zero(fee_amount, precision_digits=precision):
                    continue
                fee_line = FeeLine.create(
                    {
                        "payment_id": payment.id,
                        "fee_rule_id": fee_rule.id,
                        "amount_base": payment.amount,
                        "fee_amount": fee_amount,
                        "session_id": session.id,
                        "state": "draft",
                    }
                )
                if fee_rule.posting_policy == "immediate":
                    fee_line._post_immediate()
