# Copyright 2026 Cetmix OÜ
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import Command, _, api, fields, models
from odoo.exceptions import UserError, ValidationError
from odoo.tools.misc import formatLang


class PosOrder(models.Model):
    _inherit = "pos.order"

    write_off_amount = fields.Monetary(
        string="Write-off Amount",
        currency_field="currency_id",
        readonly=True,
        copy=False,
        help="Residual amount not received from the customer "
        "and written off with Mark as Paid.",
    )

    @api.constrains("write_off_amount")
    def _check_write_off_amount(self):
        """Forbid a negative write-off.

        :raises ValidationError: if the write-off amount is negative.
        """
        for order in self:
            if order.currency_id.compare_amounts(order.write_off_amount, 0) < 0:
                raise ValidationError(
                    _(
                        "The write-off amount of the order %(order)s "
                        "cannot be negative.",
                        order=order.name,
                    )
                )

    @api.model
    def _order_fields(self, ui_order):
        """Read the write-off amount sent by the POS.

        :param dict ui_order: order sent by the POS
        :return: values to create or write the order
        :rtype: dict
        """
        vals = super()._order_fields(ui_order)
        vals["write_off_amount"] = ui_order.get("write_off_amount", 0.0)
        return vals

    def _reset_mark_paid_amount_paid(self):
        """Set Total Paid to the payments plus the write-off.

        Core resets ``amount_paid`` to the sum of the payments. With the
        write-off included, ``action_pos_order_paid`` and the cash rounding
        computed from ``amount_paid - amount_total`` keep working as is.
        """
        for order in self:
            order.amount_paid = (
                sum(order.payment_ids.mapped("amount")) + order.write_off_amount
            )

    def _process_payment_lines(self, pos_order, order, pos_session, draft):
        """Add the write-off back to Total Paid after core resets it.

        :param dict pos_order: order sent by the POS
        :param order: order the payment lines belong to
        :type order: pos.order
        :param pos_session: session the order was created in
        :type pos_session: pos.session
        :param bool draft: whether the order is not validated yet
        """
        res = super()._process_payment_lines(pos_order, order, pos_session, draft)
        order._reset_mark_paid_amount_paid()
        return res

    def add_payment(self, data):
        """Add the write-off back to Total Paid after core resets it.

        :param dict data: values of the new payment
        """
        res = super().add_payment(data)
        self._reset_mark_paid_amount_paid()
        return res

    @api.onchange("payment_ids", "lines")
    def _onchange_amount_all(self):
        """Add the write-off back to Total Paid after core resets it."""
        res = super()._onchange_amount_all()
        for order in self:
            order.amount_paid += order.write_off_amount
        return res

    def _compute_batch_amount_all(self):
        """Add the write-off back to Total Paid after core resets it."""
        res = super()._compute_batch_amount_all()
        for order in self.filtered("write_off_amount"):
            order.amount_paid += order.write_off_amount
        return res

    def _process_saved_order(self, draft):
        """Check the write-off before the order is finalized.

        The check runs before super, outside the ``try`` that swallows the
        errors of ``action_pos_order_paid``, so a refused write-off stops the
        sync instead of leaving the order in draft.

        :param bool draft: whether the order is saved as a draft
        :return: id of the order
        :rtype: int
        """
        if not draft and self.write_off_amount:
            self._check_mark_paid_write_off()
        return super()._process_saved_order(draft)

    def _check_mark_paid_write_off(self):
        """Check that the write-off is allowed and equals the residual.

        Applies the rules of the Mark as Paid button of the payment screen to
        the stored payments, then checks that payments plus write-off equal the
        amount to pay, so that the write-off never leaks into the rounding.

        :raises UserError: if a rule is not met.
        """
        self.ensure_one()
        config = self.config_id
        currency = self.currency_id
        if not config.mark_paid_enabled:
            raise UserError(
                _(
                    "Mark as Paid is not enabled in the Point of Sale %(pos)s.",
                    pos=config.name,
                )
            )
        total = self.amount_total
        if currency.compare_amounts(total, 0) <= 0:
            raise UserError(
                _("Mark as Paid is only available for orders with a positive total.")
            )
        payments = self.payment_ids
        paid = currency.round(sum(payments.mapped("amount")))
        to_pay = self._get_rounded_amount(total, force_round=True)
        residual = currency.round(to_pay - paid)
        if currency.compare_amounts(residual, 0) <= 0:
            raise UserError(_("Nothing is left to pay."))
        if not payments.filtered(
            lambda p: p.payment_method_id.is_cash_count
            and currency.compare_amounts(p.amount, 0) > 0
        ):
            raise UserError(_("Mark as Paid requires a cash payment."))
        if payments.filtered(lambda p: p.payment_method_id.type == "pay_later"):
            raise UserError(
                _("Mark as Paid is not available with a Customer Account payment.")
            )
        max_amount = config.mark_paid_max_amount
        if max_amount and currency.compare_amounts(residual, max_amount) > 0:
            raise UserError(
                _(
                    "The residual %(residual)s exceeds the maximum write-off "
                    "of %(max)s.",
                    residual=formatLang(self.env, residual, currency_obj=currency),
                    max=formatLang(self.env, max_amount, currency_obj=currency),
                )
            )
        max_percent = config.mark_paid_max_percent
        max_by_percent = currency.round(total * max_percent / 100)
        if max_percent and currency.compare_amounts(residual, max_by_percent) > 0:
            raise UserError(
                _(
                    "The residual %(residual)s exceeds %(percent)s%% "
                    "of the order total (%(max)s).",
                    residual=formatLang(self.env, residual, currency_obj=currency),
                    percent=formatLang(self.env, max_percent),
                    max=formatLang(self.env, max_by_percent, currency_obj=currency),
                )
            )
        if currency.compare_amounts(self.write_off_amount, residual):
            raise UserError(
                _(
                    "The write-off amount %(write_off)s does not match "
                    "the residual %(residual)s.",
                    write_off=formatLang(
                        self.env, self.write_off_amount, currency_obj=currency
                    ),
                    residual=formatLang(self.env, residual, currency_obj=currency),
                )
            )

    def _export_for_ui(self, order):
        """Send the write-off to the POS, for the ticket screen and reprints.

        :param order: order to export
        :type order: pos.order
        :return: order values for the POS
        :rtype: dict
        """
        res = super()._export_for_ui(order)
        res["write_off_amount"] = order.write_off_amount
        return res

    def _prepare_invoice_lines(self):
        """Add the write-off line, so the invoice total is the amount received.

        The line keeps the default ``product`` display type: account treats
        every ``rounding`` line as the cash rounding line and rewrites it.

        :return: commands to fill ``invoice_line_ids``
        :rtype: list
        """
        invoice_lines = super()._prepare_invoice_lines()
        if self.write_off_amount:
            invoice_lines.append(
                Command.create(
                    {
                        "name": self.config_id.mark_paid_label,
                        "account_id": self.config_id.mark_paid_account_id.id,
                        "quantity": 1,
                        "price_unit": -self.write_off_amount,
                        "tax_ids": [Command.set([])],
                    }
                )
            )
        return invoice_lines

    def _prepare_aml_values_list_per_nature(self):
        """Add the write-off to the lines that reverse the closing entry.

        Used when the order is invoiced after its session is closed. The
        write-off account is read at invoicing time, as core does for the cash
        rounding accounts.

        :return: journal item values grouped by nature
        :rtype: dict
        """
        aml_vals_list_per_nature = super()._prepare_aml_values_list_per_nature()
        if not self.write_off_amount:
            return aml_vals_list_per_nature
        company_currency = self.company_id.currency_id
        rate = self.currency_id._get_conversion_rate(
            self.currency_id, company_currency, self.company_id, self.date_order
        )
        aml_vals_list_per_nature["write_off"].append(
            {
                "name": _("Write-off"),
                "account_id": self.config_id.mark_paid_account_id.id,
                "partner_id": self.partner_id.commercial_partner_id.id,
                "currency_id": self.currency_id.id,
                "amount_currency": self.write_off_amount,
                "balance": company_currency.round(self.write_off_amount * rate),
            }
        )
        config = self.config_id
        if (
            config.cash_rounding
            and config.rounding_method
            and config.only_round_cash_method
            and any(not p.payment_method_id.is_cash_count for p in self.payment_ids)
        ):
            self._remove_write_off_from_cash_rounding(aml_vals_list_per_nature, rate)
        return aml_vals_list_per_nature

    def _remove_write_off_from_cash_rounding(self, aml_vals_list_per_nature, rate):
        """Take the write-off out of the cash rounding of mixed payments.

        With "Only on cash methods" and mixed payments, core computes the
        rounding from the payments, which do not include the write-off
        (point_of_sale/models/pos_order.py:751-755). The rounding then holds
        the write-off too. Rebuild the rounding line with core's own rules, so
        the rounding account gets the pure rounding and the reversal stays
        balanced. The line may be missing (core skips a zero rounding) and its
        sign may change, which switches the loss and profit accounts.

        Only the "Add a rounding line" strategy exists here: a Point of Sale
        refuses any other (point_of_sale/models/pos_config.py:270-282).

        :param dict aml_vals_list_per_nature: journal item values grouped by
            nature, updated in place
        :param float rate: rate from the order currency to the company currency
        """
        cash_rounding = self.config_id.rounding_method
        rounding_vals_list = aml_vals_list_per_nature["cash_rounding"]
        # Orders with a write-off are positive, so core's sign is -1.
        amount_currency = self.currency_id.round(
            sum(vals["amount_currency"] for vals in rounding_vals_list)
            - self.write_off_amount
        )
        rounding_vals_list.clear()
        if self.currency_id.is_zero(amount_currency):
            return
        if amount_currency > 0.0 and cash_rounding.loss_account_id:
            account = cash_rounding.loss_account_id
        else:
            account = cash_rounding.profit_account_id
        rounding_vals_list.append(
            {
                "name": cash_rounding.name,
                "account_id": account.id,
                "partner_id": self.partner_id.commercial_partner_id.id,
                "currency_id": self.currency_id.id,
                "amount_currency": amount_currency,
                "balance": self.company_id.currency_id.round(amount_currency * rate),
                "display_type": "rounding",
            }
        )
