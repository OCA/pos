# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
from odoo.tools import float_compare


class PosPayment(models.Model):
    _inherit = "pos.payment"

    foreign_currency_id = fields.Many2one(
        comodel_name="res.currency",
        string="Tender Currency",
    )
    amount_currency = fields.Monetary(
        string="Amount in Currency",
        currency_field="foreign_currency_id",
    )
    foreign_currency_rate = fields.Float(
        string="Tender Rate",
        digits=0,
        help="Foreign-currency units for one unit of the Point of Sale currency.",
    )

    @api.constrains(
        "foreign_currency_id",
        "amount_currency",
        "foreign_currency_rate",
        "amount",
        "payment_method_id",
        "is_change",
    )
    def _check_foreign_currency(self):
        """Run the foreign-tender rules on every payment in the recordset.

        :raise ValidationError: a tender is incomplete or not allowed
        """
        for payment in self:
            payment._check_foreign_currency_allowed()

    def _check_foreign_currency_allowed(self):
        """Validate a foreign tender, or accept a payment that has none.

        All of tender currency, amount and rate are set, or none of them.
        A customer module can override this to relax a single eligibility rule.

        :raise ValidationError: the tender is incomplete or not allowed
        """
        self.ensure_one()
        currency = self.foreign_currency_id
        has_amount = bool(currency) and not currency.is_zero(self.amount_currency)
        has_rate = (
            float_compare(self.foreign_currency_rate, 0.0, precision_digits=12) != 0
        )
        if not currency and not has_amount and not has_rate:
            return
        if not (currency and has_amount and has_rate):
            raise ValidationError(
                _(
                    "Set the tender currency, the amount in that "
                    "currency and the tender rate together."
                )
            )
        order = self.pos_order_id
        config = order.session_id.config_id
        if config.currency_id != order.company_id.currency_id:
            raise ValidationError(
                _(
                    "A foreign tender requires the Point of Sale "
                    "currency to be the company currency."
                )
            )
        if currency == order.currency_id:
            raise ValidationError(
                _("The tender currency must differ from the Point of Sale currency.")
            )
        if currency not in config.foreign_currency_ids:
            raise ValidationError(
                _(
                    "%(currency)s is not a foreign currency of this Point of Sale.",
                    currency=currency.name,
                )
            )
        method = self.payment_method_id
        if method.type not in ("cash", "bank"):
            raise ValidationError(
                _("A foreign tender is only available on a cash or bank payment.")
            )
        if method.use_payment_terminal:
            raise ValidationError(_("A payment terminal cannot take a foreign tender."))
        if self.is_change:
            raise ValidationError(_("Change is given in the Point of Sale currency."))
        if self.payment_status:
            raise ValidationError(_("A foreign tender cannot carry a payment status."))
        if method.type == "cash":
            cash_method = order.session_id.payment_method_ids.filtered("is_cash_count")[
                :1
            ]
            if method != cash_method:
                raise ValidationError(
                    _(
                        "Foreign cash is taken on %(method)s.",
                        method=cash_method.display_name,
                    )
                )
        amount_sign = float_compare(
            self.amount, 0.0, precision_rounding=order.currency_id.rounding
        )
        currency_sign = float_compare(
            self.amount_currency, 0.0, precision_rounding=currency.rounding
        )
        if amount_sign != currency_sign:
            raise ValidationError(
                _(
                    "The Point of Sale amount and the tender "
                    "amount must have the same sign."
                )
            )
        if not self._foreign_amount_matches_rate():
            raise ValidationError(
                _(
                    "The tender amount does not match the Point of Sale "
                    "amount at the tender rate."
                )
            )

    def _foreign_amount_matches_rate(self):
        """Whether the Point of Sale amount agrees with the tender at this rate.

        Exact foreign due and a converted amount both round, so one unit of
        each currency is accepted. A module that prices the tender from a
        pricelist overrides this instead of the currency rate.

        :return: ``True`` when the two amounts agree
        :rtype: bool
        """
        self.ensure_one()
        order = self.pos_order_id
        currency = self.foreign_currency_id
        expected_currency = self.amount * self.foreign_currency_rate
        tolerance = currency.rounding + order.currency_id.rounding * abs(
            self.foreign_currency_rate
        )
        return abs(self.amount_currency - expected_currency) <= tolerance

    def _export_for_ui(self, payment):
        """Export one payment for the Point of Sale, with foreign tender fields.

        :param payment: ``pos.payment`` record
        :return: UI payment values
        :rtype: dict
        """
        result = super()._export_for_ui(payment)
        result.update(
            {
                "foreign_currency_id": payment.foreign_currency_id.id,
                "amount_currency": payment.amount_currency,
                "foreign_currency_rate": payment.foreign_currency_rate,
            }
        )
        return result
