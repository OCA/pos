from odoo import fields, models


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

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
        help="Used only when a fee rule's Posting Policy is 'At Session "
        "Close'.\n"
        "Grouped: fees are summarized per fee rule into a single "
        "journal entry (recommended for high transaction volume).\n"
        "Detailed: one journal entry is generated per transaction "
        "fee (recommended for audit / fiscal traceability).",
    )

    def _is_write_forbidden(self, fields):
        whitelisted_fields = {"fee_ids", "fee_grouping_policy"}
        return super()._is_write_forbidden(fields - whitelisted_fields)
