from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    use_transaction_fees = fields.Boolean(
        help="Compute and post the financial cost (acquirer or gateway fees) "
        "of the payments made with this method. Only available for payment "
        "methods with a bank journal. Disabling it only affects new payments: "
        "fees already computed are kept and posted.",
    )
    fee_ids = fields.One2many(
        comodel_name="pos.payment.method.fee",
        inverse_name="payment_method_id",
        string="Transaction Fees",
    )
    fee_grouping_policy = fields.Selection(
        selection=[
            ("grouped", "Grouped"),
            ("detailed", "Detailed"),
        ],
        default="grouped",
        required=True,
        help="Both policies generate one journal entry per session, company, "
        "journal and accounting date.\n"
        "Grouped: one expense line per expense account.\n"
        "Detailed: one expense line per transaction fee.",
    )

    @api.constrains("use_transaction_fees", "journal_id", "split_transactions")
    def _check_transaction_fees_bank_journal(self):
        for method in self:
            if method.type != "bank" and (
                method.use_transaction_fees or method.fee_ids
            ):
                raise ValidationError(
                    _(
                        "Transaction fees can only be used on payment methods with a "
                        'bank journal ("%(method)s").',
                        method=method.display_name,
                    )
                )

    def _is_write_forbidden(self, fields):
        whitelisted_fields = {"use_transaction_fees", "fee_ids", "fee_grouping_policy"}
        return super()._is_write_forbidden(fields - whitelisted_fields)

    def _fees_applicable(self):
        """Return whether new payments of this method must generate fees."""
        self.ensure_one()
        return self.use_transaction_fees and self.type == "bank"

    def _get_fee_counterpart_account(self):
        """Effective outstanding account of the method, the same one the
        standard session closing uses for bank payments."""
        self.ensure_one()
        return (
            self.outstanding_account_id
            or self.company_id.account_journal_payment_debit_account_id
        )
