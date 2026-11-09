from odoo import api, fields, models
from odoo.tools import float_compare


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    auto_apply_credit_amount = fields.Boolean(
        "Automatic Pay by Credit Amount", default=True
    )
    auto_apply_credit_amount_mode = fields.Selection(
        [
            ("auto", "Automatic"),
            ("wait_review", "Wait for Review"),
        ],
        string="Automatic Pay by Credit Amount Mode",
        default="wait_review",
        help="Automatic: Automatically apply credit amount to the order if available.\n"
        "Wait for Review: Wait for the cashier to review and apply the credit amount.",
    )

    def _get_payment_terminal_selection(self):
        selection = super()._get_payment_terminal_selection()
        return selection + [("credit", self.env._("Credit"))]

    @api.onchange("use_payment_terminal")
    def _onchange_use_payment_terminal(self):
        res = super()._onchange_use_payment_terminal()
        for method in self:
            if method.use_payment_terminal == "credit":
                method.payment_method_type = "terminal"
        return res

    @api.model
    def _load_pos_data_fields(self, config_id):
        params = super()._load_pos_data_fields(config_id)
        params += ["auto_apply_credit_amount", "auto_apply_credit_amount_mode"]
        return params

    @api.model
    def pos_payment_credit_payment(self, partner_id, amount, order_id=None):
        """
        Process payment with credit amount
        Deducts the amount from partner's credit_amount
        """
        Partner = self.env["res.partner"]
        partner = Partner.browse(partner_id)

        if not partner.exists():
            return {
                "status": "error",
                "error": self.env._("Partner not found"),
            }

        decimal_precision = self.env["decimal.precision"].precision_get("Product Price")
        if (
            float_compare(
                partner.credit_amount, amount, precision_digits=decimal_precision
            )
            < 0
        ):
            return {
                "status": "error",
                "error": self.env._("Insufficient credit balance"),
                "available_credit": partner.credit_amount,
            }

        # Deduct credit amount
        partner.sudo().write({"credit_amount": partner.credit_amount - amount})

        return {
            "status": "success",
            "remaining_credit": partner.credit_amount,
            "transaction_id": f"CREDIT-{partner.id}-{order_id or 'NEW'}",
        }

    @api.model
    def pos_payment_credit_refund(self, partner_id, amount, order_id=None):
        """
        Process refund to credit amount
        Adds the refunded amount to partner's credit_amount
        """
        Partner = self.env["res.partner"]
        partner = Partner.browse(partner_id)

        if not partner.exists():
            return {
                "status": "error",
                "error": self.env._("Partner not found"),
            }

        # Add refunded amount to credit
        partner.sudo().write({"credit_amount": partner.credit_amount + amount})

        return {
            "status": "success",
            "new_credit_balance": partner.credit_amount,
            "transaction_id": f"REFUND-{partner.id}-{order_id or 'NEW'}",
        }

    @api.model
    def pos_payment_credit_get_balance(self, partner_id):
        """
        Get current credit balance for a partner
        """
        Partner = self.env["res.partner"]
        partner = Partner.browse(partner_id)

        if not partner.exists():
            return {
                "status": "error",
                "error": self.env._("Partner not found"),
            }

        return {
            "status": "success",
            "credit_amount": partner.credit_amount,
        }
