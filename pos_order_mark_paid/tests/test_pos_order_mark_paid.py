# Copyright 2026 Cetmix OÜ
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from datetime import timedelta

from odoo import fields
from odoo.exceptions import UserError
from odoo.tests import tagged
from odoo.tools import mute_logger

from .common import TestMarkPaidCommon


@tagged("post_install", "-at_install")
class TestPosOrderMarkPaid(TestMarkPaidCommon):
    def _assert_refused(self, product, payments, write_off, **kwargs):
        """Check that the server refuses the write-off and rolls the sync back."""
        with mute_logger("odoo.addons.point_of_sale.models.pos_order"):
            with self.assertRaises(UserError):
                self._sync_order(product, payments, write_off, **kwargs)

    # Server order processing

    def test_write_off_order_paid(self):
        self.open_new_session()
        order = self._sync_order(self.product_10007, [(self.cash_pm1, 100.0)], 0.07)
        self.assertEqual(order.state, "paid")
        self.assertAlmostEqual(order.amount_paid, 100.07)
        self.assertAlmostEqual(order.write_off_amount, 0.07)
        self.assertAlmostEqual(sum(order.payment_ids.mapped("amount")), 100.0)

    def test_refused_rules(self):
        self.open_new_session()
        cases = [
            (
                "negative total",
                self.product_10007,
                [(self.cash_pm1, -100.0)],
                0.07,
                {"quantity": -1},
            ),
            ("nothing left", self.product_10007, [(self.cash_pm1, 100.07)], 0.07, {}),
            ("no cash", self.product_10007, [(self.bank_pm1, 100.0)], 0.07, {}),
            (
                "customer account",
                self.product_10007,
                [(self.cash_pm1, 50.0), (self.pay_later_pm, 50.0)],
                0.07,
                {"customer": self.customer},
            ),
            # 2.07 is within 5% (5.00) but over the amount (1.00).
            ("over amount", self.product_10007, [(self.cash_pm1, 98.0)], 2.07, {}),
            # 0.57 is within the amount (1.00) but over 5% (0.50).
            ("over percent", self.product_1007, [(self.cash_pm1, 9.5)], 0.57, {}),
        ]
        for name, product, payments, write_off, kwargs in cases:
            with self.subTest(name):
                self._assert_refused(product, payments, write_off, **kwargs)
        self.assertFalse(self.pos_session.order_ids)

    def test_refused_when_disabled(self):
        self.config.mark_paid_enabled = False
        self.open_new_session()
        self._assert_refused(self.product_10007, [(self.cash_pm1, 100.0)], 0.07)

    def test_zero_percent_is_no_limit(self):
        self.config.mark_paid_max_percent = 0
        self.open_new_session()
        order = self._sync_order(self.product_1007, [(self.cash_pm1, 9.5)], 0.57)
        self.assertEqual(order.state, "paid")

    def test_zero_amount_is_no_limit(self):
        self.config.mark_paid_max_amount = 0
        self.open_new_session()
        order = self._sync_order(self.product_10007, [(self.cash_pm1, 98.0)], 2.07)
        self.assertEqual(order.state, "paid")

    def test_limits_are_inclusive(self):
        self.open_new_session()
        order = self._sync_order(self.product_10007, [(self.cash_pm1, 99.07)], 1.0)
        self.assertEqual(order.state, "paid")
        # 5% of 10.07 is 0.5035, rounded to 0.50
        order = self._sync_order(self.product_1007, [(self.cash_pm1, 9.57)], 0.5)
        self.assertEqual(order.state, "paid")

    def test_amount_paid_keeps_write_off(self):
        self.open_new_session()
        order = self._sync_order(self.product_10007, [(self.cash_pm1, 100.0)], 0.07)
        order._compute_batch_amount_all()
        self.assertAlmostEqual(order.amount_paid, 100.07)
        draft = self._sync_order(
            self.product_10007, [(self.cash_pm1, 50.0)], 0.07, draft=True
        )
        self.assertAlmostEqual(draft.amount_paid, 50.07)
        draft.add_payment(
            {
                "pos_order_id": draft.id,
                "amount": 25.0,
                "payment_method_id": self.cash_pm1.id,
            }
        )
        self.assertAlmostEqual(draft.amount_paid, 75.07)
        draft._onchange_amount_all()
        self.assertAlmostEqual(draft.amount_paid, 75.07)

    def test_draft_is_not_checked(self):
        self.open_new_session()
        draft = self._sync_order(
            self.product_100, [(self.cash_pm1, 90.0)], 10.0, draft=True
        )
        self.assertEqual(draft.state, "draft")
        self.assertAlmostEqual(draft.write_off_amount, 10.0)

    def test_write_off_must_equal_residual_with_cash_rounding(self):
        self._set_cash_rounding()
        self.open_new_session()
        # 100.07 rounds to 100.05: the residual of 100.00 is 0.05.
        for write_off in (0.06, 0.04):
            with self.subTest(write_off=write_off):
                self._assert_refused(
                    self.product_10007, [(self.cash_pm1, 100.0)], write_off
                )
        order = self._sync_order(self.product_10007, [(self.cash_pm1, 100.0)], 0.05)
        self.assertEqual(order.state, "paid")

    def test_write_off_must_equal_residual(self):
        self.open_new_session()
        self._assert_refused(self.product_10007, [(self.cash_pm1, 100.0)], 0.06)

    def test_payment_wizard(self):
        self.open_new_session()
        order = self._sync_order(self.product_100, [], 10.0, draft=True)
        with self.assertRaises(UserError):
            self.make_payment(order, self.cash_pm1, 90.0)
        self.assertEqual(order.state, "draft")
        self.assertFalse(order.payment_ids)
        order = self._sync_order(self.product_100, [], 0.5, draft=True)
        self.make_payment(order, self.cash_pm1, 99.5)
        self.assertEqual(order.state, "paid")

    def test_export_for_ui(self):
        self.open_new_session()
        order = self._sync_order(self.product_10007, [(self.cash_pm1, 100.0)], 0.07)
        self.assertAlmostEqual(order.export_for_ui()[0]["write_off_amount"], 0.07)

    # Session close

    def _write_off_lines(self, move):
        return move.line_ids.filtered(
            lambda line: line.account_id == self.write_off_account
        )

    def test_session_write_off_line(self):
        self.open_new_session()
        self._sync_order(self.product_10007, [(self.cash_pm1, 100.0)], 0.07)
        self._sync_order(self.product_1007, [(self.cash_pm1, 10.0)], 0.07)
        self._close_session()
        move = self.pos_session.move_id
        self.assertEqual(move.state, "posted")
        write_off_line = self._write_off_lines(move)
        self.assertEqual(len(write_off_line), 1)
        self.assertEqual(write_off_line.name, "Write-off")
        self.assertAlmostEqual(write_off_line.debit, 0.14)

    def test_session_with_cash_rounding(self):
        self._set_cash_rounding()
        self.open_new_session()
        self._sync_order(self.product_10007, [(self.cash_pm1, 100.0)], 0.05)
        self._close_session()
        move = self.pos_session.move_id
        self.assertAlmostEqual(self._write_off_lines(move).debit, 0.05)
        rounding_line = move.line_ids.filtered(
            lambda line: line.account_id == self.rounding_loss_account
        )
        self.assertAlmostEqual(rounding_line.debit, 0.02)

    def test_session_mixed_payments(self):
        self.open_new_session()
        self._sync_order(
            self.product_10007,
            [(self.bank_pm1, 50.0), (self.cash_pm1, 50.0)],
            0.07,
        )
        self._close_session()
        self.assertAlmostEqual(
            self._write_off_lines(self.pos_session.move_id).debit, 0.07
        )

    # Invoices

    def _write_off_invoice_line(self, invoice):
        return invoice.invoice_line_ids.filtered(
            lambda line: line.name == "Extra discount"
        )

    def test_invoice_write_off_line(self):
        self.open_new_session()
        order = self._sync_order(
            self.product_taxed_10007,
            [(self.cash_pm1, 100.0)],
            0.07,
            customer=self.customer,
            is_invoiced=True,
        )
        invoice = order.account_move
        line = self._write_off_invoice_line(invoice)
        self.assertEqual(line.account_id, self.write_off_account)
        self.assertFalse(line.tax_ids)
        self.assertEqual(line.display_type, "product")
        self.assertAlmostEqual(line.price_unit, -0.07)
        self.assertAlmostEqual(invoice.amount_tax, order.amount_tax)
        self.assertAlmostEqual(invoice.amount_total, 100.0)
        self.assertEqual(invoice.payment_state, "paid")
        self._close_session()
        self.assertFalse(self._write_off_lines(self.pos_session.move_id))

    def test_invoice_with_cash_rounding(self):
        self._set_cash_rounding()
        self.open_new_session()
        order = self._sync_order(
            self.product_taxed_10007,
            [(self.cash_pm1, 100.0)],
            0.05,
            customer=self.customer,
            is_invoiced=True,
        )
        invoice = order.account_move
        self.assertAlmostEqual(self._write_off_invoice_line(invoice).price_unit, -0.05)
        rounding_line = invoice.line_ids.filtered(
            lambda line: line.display_type == "rounding"
        )
        self.assertAlmostEqual(rounding_line.balance, 0.02)
        self.assertAlmostEqual(invoice.amount_total, 100.0)
        self.assertEqual(invoice.payment_state, "paid")

    def test_invoice_after_closing(self):
        self.open_new_session()
        order = self._sync_order(
            self.product_10007,
            [(self.cash_pm1, 100.0)],
            0.07,
            customer=self.customer,
        )
        self._close_session()
        other_account = self.write_off_account.copy({"code": "WOFF02"})
        self.config.mark_paid_account_id = other_account
        order.action_pos_order_invoice()
        self.assertEqual(order.account_move.payment_state, "paid")
        self.assertAlmostEqual(order.account_move.amount_total, 100.0)
        # The closing entry keeps the write-off on the first account; the
        # reversal and the invoice line cancel out on the new one.
        self.assertAlmostEqual(self._account_balance(self.write_off_account), 0.07)
        self.assertAlmostEqual(self._account_balance(other_account), 0.0)

    def _invoice_mixed_after_closing(self, product, bank_amount, write_off):
        """Pay with bank and 50.00 cash, close, then invoice the order.

        :return: rounding applied to the order (amount to pay - total)
        :rtype: float
        """
        self.open_new_session()
        order = self._sync_order(
            product,
            [(self.bank_pm1, bank_amount), (self.cash_pm1, 50.0)],
            write_off,
            customer=self.customer,
        )
        self._close_session()
        order.action_pos_order_invoice()
        self.assertEqual(order.account_move.payment_state, "paid")
        return order.amount_paid - order.amount_total

    def test_invoice_after_closing_mixed_rounding_line(self):
        self._set_cash_rounding(only_round_cash_method=True)
        rounding_accounts = self.rounding_loss_account | self.rounding_profit_account
        write_off_total = 0.0
        rounding_total = 0.0
        cases = [
            # core rounding 0.04 becomes 0.02
            ("adjusted", self.product_taxed_10007, 50.03, 0.02),
            # core rounding 0.00 (no line) becomes -0.02
            ("created", self.product_taxed_10003, 50.03, 0.02),
            # core rounding 0.03 (loss) becomes -0.02 (profit)
            ("sign flip", self.product_taxed_10003, 50.0, 0.05),
        ]
        for name, product, bank_amount, write_off in cases:
            with self.subTest(name):
                rounding_total += self._invoice_mixed_after_closing(
                    product, bank_amount, write_off
                )
                write_off_total += write_off
                self.assertAlmostEqual(
                    self._account_balance(self.write_off_account), write_off_total
                )
                # Closing and reversal cancel out: only the invoice rounding stays.
                self.assertAlmostEqual(
                    self._account_balance(rounding_accounts), -rounding_total
                )

    # Session report

    def test_sale_details(self):
        self.open_new_session()
        order = self._sync_order(self.product_10007, [(self.cash_pm1, 100.0)], 0.07)
        invoiced = self._sync_order(
            self.product_taxed_10007,
            [(self.cash_pm1, 100.0)],
            0.07,
            customer=self.customer,
            is_invoiced=True,
        )
        report = self.env["report.point_of_sale.report_saledetails"]
        details = report.get_sale_details(session_ids=self.pos_session.ids)
        self.assertAlmostEqual(details["write_off_total"], 0.14)
        self.assertAlmostEqual(details["cash_rounding_total"], 0.0)
        self.assertAlmostEqual(
            details["invoiceTotal"], invoiced.account_move.amount_total
        )
        details = report.get_sale_details(
            date_start=fields.Datetime.to_string(order.date_order - timedelta(hours=1)),
            date_stop=fields.Datetime.to_string(order.date_order + timedelta(hours=1)),
            config_ids=self.config.ids,
        )
        self.assertAlmostEqual(details["write_off_total"], 0.14)
