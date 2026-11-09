from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosPaymentMethodFee(models.Model):
    _name = "pos.payment.method.fee"
    _description = "POS Payment Method Fee Rule"
    _order = "sequence, id"
    _check_company_auto = True

    name = fields.Char(required=True)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)
    payment_method_id = fields.Many2one(
        comodel_name="pos.payment.method",
        required=True,
        ondelete="cascade",
        index=True,
    )
    company_id = fields.Many2one(
        related="payment_method_id.company_id",
        store=True,
        index=True,
    )
    fee_type = fields.Selection(
        selection=[
            ("percentage", "Percentage"),
            ("fixed", "Fixed"),
        ],
        required=True,
        default="percentage",
    )
    amount = fields.Float(
        required=True,
        digits="Product Price",
        help="Percentage of the payment amount (e.g. 1.5 for 1.5 %) when the "
        "Fee Type is Percentage, or amount charged per transaction, in the "
        "fee currency, when the Fee Type is Fixed.",
    )
    currency_id = fields.Many2one(
        comodel_name="res.currency",
        string="Fee Currency",
        required=True,
        default=lambda self: self.env.company.currency_id,
        help="Currency in which the bank charges the fixed fee. It is "
        "converted to the payment currency at the payment date.",
    )
    apply_on_refunds = fields.Boolean(
        help="If set, refund payments also generate this fee, computed on the "
        "absolute refunded amount. Original fees are never reversed.",
    )
    account_id = fields.Many2one(
        comodel_name="account.account",
        string="Fee Account",
        required=True,
        check_company=True,
        domain="[('deprecated', '=', False)]",
        help="Expense account used to book the financial cost.",
    )
    counterpart_account_id = fields.Many2one(
        comodel_name="account.account",
        check_company=True,
        domain="[('deprecated', '=', False), ('reconcile', '=', True)]",
        help="Account credited as counterpart of the fee. Leave empty to use "
        "the outstanding account of the payment method that is in force when "
        "the fee is computed, so that the fee nets against the payment "
        "settled by the bank.",
    )
    journal_id = fields.Many2one(
        comodel_name="account.journal",
        string="Posting Journal",
        required=True,
        check_company=True,
        domain="[('type', 'in', ('bank', 'general'))]",
    )
    posting_policy = fields.Selection(
        selection=[
            ("immediate", "Immediate"),
            ("session_close", "At Session Close"),
        ],
        required=True,
        default="session_close",
        help="Immediate: the journal entry is posted when the order is "
        "validated.\n"
        "At Session Close: the journal entry is posted when the session is "
        "closed, grouped according to the payment method policy.",
    )

    @api.constrains("fee_type", "amount")
    def _check_amount(self):
        for rule in self:
            if rule.fee_type == "percentage" and not 0 <= rule.amount <= 100:
                raise ValidationError(
                    _(
                        'The percentage fee "%(name)s" must be between 0 and 100.',
                        name=rule.name,
                    )
                )
            if rule.fee_type == "fixed" and rule.amount < 0:
                raise ValidationError(
                    _(
                        'The fixed fee "%(name)s" cannot be negative.',
                        name=rule.name,
                    )
                )

    @api.constrains("payment_method_id")
    def _check_payment_method(self):
        for rule in self:
            method = rule.payment_method_id
            if method.type != "bank":
                raise ValidationError(
                    _(
                        "Transaction fees can only be configured on payment "
                        'methods with a bank journal ("%(method)s").',
                        method=method.display_name,
                    )
                )
            if not method.company_id:
                raise ValidationError(
                    _(
                        'The payment method "%(method)s" must belong to a company '
                        "to configure transaction fees.",
                        method=method.display_name,
                    )
                )

    @api.constrains("account_id", "counterpart_account_id", "journal_id")
    def _check_accounting_configuration(self):
        for rule in self:
            if rule.account_id.deprecated:
                raise ValidationError(
                    _('The fee account of "%(name)s" is deprecated.', name=rule.name)
                )
            counterpart = rule.counterpart_account_id
            if counterpart and (counterpart.deprecated or not counterpart.reconcile):
                raise ValidationError(
                    _(
                        'The counterpart account of "%(name)s" must be active and '
                        "allow reconciliation.",
                        name=rule.name,
                    )
                )
            if rule.journal_id.type not in ("bank", "general"):
                raise ValidationError(
                    _(
                        'The posting journal of "%(name)s" must be a bank or a '
                        "miscellaneous journal.",
                        name=rule.name,
                    )
                )

    def _get_counterpart_account(self):
        """Counterpart account effective right now for this rule."""
        self.ensure_one()
        return (
            self.counterpart_account_id
            or self.payment_method_id._get_fee_counterpart_account()
        )

    def _get_fee_amounts(self, payment):
        """Return ``(fee_amount, fee_amount_company)`` for ``payment``.

        ``fee_amount`` is expressed in the payment currency and
        ``fee_amount_company`` in the company currency. Both are positive:
        a fee is always a cost. Conversions use the payment date, the same
        date the standard session closing uses to convert the payment, so
        that the fee and the settled amount share the same exchange rate.
        Refunds only generate a fee when the rule applies on refunds.
        """
        self.ensure_one()
        currency = payment.currency_id
        company = payment.company_id
        company_currency = company.currency_id
        date = payment.payment_date
        if payment.amount < 0 and not self.apply_on_refunds:
            return 0.0, 0.0
        if self.fee_type == "percentage":
            fee_amount = currency.round(abs(payment.amount) * self.amount / 100.0)
            fee_amount_company = currency._convert(
                fee_amount, company_currency, company, date
            )
        else:
            fee_amount = self.currency_id._convert(self.amount, currency, company, date)
            fee_amount_company = self.currency_id._convert(
                self.amount, company_currency, company, date
            )
        return fee_amount, fee_amount_company
