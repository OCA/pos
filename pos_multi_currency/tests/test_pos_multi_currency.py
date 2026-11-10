# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from psycopg2 import IntegrityError

from odoo import fields
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.tests import tagged
from odoo.tools import mute_logger

from .common import TestPosMultiCurrencyCommon


@tagged("post_install", "-at_install")
class TestPosMultiCurrencyConfig(TestPosMultiCurrencyCommon):
    def test_empty_list_is_off(self):
        self.basic_config.foreign_currency_ids = False
        self.assertFalse(self.basic_config.foreign_currency_ids)

    def test_pos_currency_cannot_be_listed(self):
        with self.assertRaises(ValidationError):
            self.basic_config.foreign_currency_ids = self.basic_config.currency_id

    def test_foreign_list_requires_company_currency(self):
        with self.assertRaises(ValidationError):
            self.other_currency_config.foreign_currency_ids = self.currency_f

    def test_open_session_blocks_the_list(self):
        self.open_new_session()
        with self.assertRaises(UserError):
            self.basic_config.foreign_currency_ids = self.currency_f

    def test_open_session_blocks_plain_write_values(self):
        self.open_new_session()
        same_ids = [
            self.currency_f.id,
            self.currency_g.id,
            self.currency_h.id,
        ]
        self.basic_config.write({"foreign_currency_ids": same_ids})
        self.basic_config.write(
            {
                "foreign_currency_ids": self.currency_f
                | self.currency_g
                | self.currency_h
            }
        )
        with self.assertRaises(UserError):
            self.basic_config.write({"foreign_currency_ids": self.currency_f})
        with self.assertRaises(UserError):
            self.basic_config.write({"foreign_currency_ids": [self.currency_f.id]})
        with self.assertRaises(UserError):
            self.basic_config.write({"foreign_currency_ids": False})
        with self.assertRaises(UserError):
            self.basic_config.write(
                {"foreign_currency_ids": [(0, 0, {"name": "ZZZ", "symbol": "Z"})]}
            )

    def test_foreign_sales_journal_is_refused(self):
        journal = self.basic_config.journal_id.copy(
            {
                "name": "Foreign POS sales",
                "code": "FPS",
                "currency_id": self.currency_f.id,
            }
        )
        with self.assertRaises(ValidationError):
            self.basic_config.journal_id = journal

    def test_cannot_remove_currency_with_a_balance(self):
        session = self.open_new_session()
        method = session._get_cash_control_method()
        self.env["pos.session.currency.balance"].create(
            {
                "session_id": session.id,
                "payment_method_id": method.id,
                "currency_id": self.currency_f.id,
                "balance_end_real": 10.0,
            }
        )
        session.set_foreign_closing_counts(
            [
                {
                    "payment_method_id": method.id,
                    "currency_id": self.currency_f.id,
                    "amount": 10.0,
                }
            ]
        )
        self._close_session(
            session,
            cash_count=0,
            foreign_counts=[
                {
                    "payment_method_id": method.id,
                    "currency_id": self.currency_f.id,
                    "amount": 10.0,
                }
            ],
        )
        with self.assertRaises(UserError):
            self.basic_config.foreign_currency_ids = [(3, self.currency_f.id)]


@tagged("post_install", "-at_install")
class TestPosMultiCurrencyPayment(TestPosMultiCurrencyCommon):
    def test_foreign_keys_round_trip(self):
        self.open_new_session()
        order = self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )
        payment = order.payment_ids
        self.assertEqual(payment.foreign_currency_id, self.currency_f)
        self.assertEqual(payment.amount_currency, 50.0)
        self.assertAlmostEqual(payment.foreign_currency_rate, 1 / 4.40, places=6)
        self.assertEqual(payment.amount, 220.0)
        exported = payment._export_for_ui(payment)
        self.assertEqual(exported["foreign_currency_id"], self.currency_f.id)
        self.assertEqual(exported["amount_currency"], 50.0)

    @mute_logger("odoo.addons.point_of_sale.models.pos_order")
    def test_mismatched_tender_amount_is_refused(self):
        self.open_new_session()
        with self.assertRaises(ValidationError):
            self._pay_order(
                self.product_220,
                [
                    self._foreign_payment_line(
                        self.cash_pm1,
                        5.0,
                        self.currency_f,
                        pos_amount=220.0,
                    )
                ],
            )

    @mute_logger("odoo.addons.point_of_sale.models.pos_order")
    def test_pay_later_is_refused(self):
        self.basic_config.payment_method_ids = [
            (6, 0, [self.cash_pm1.id, self.pay_later_pm.id])
        ]
        self.open_new_session()
        with self.assertRaises(ValidationError):
            self._pay_order(
                self.product_220,
                [self._foreign_payment_line(self.pay_later_pm, 50.0, self.currency_f)],
            )

    @mute_logger("odoo.addons.point_of_sale.models.pos_order")
    def test_second_cash_method_is_refused(self):
        extra_cash = self.cash_pm1.copy(
            default={"name": "Cash 2", "journal_id": self.cash_pm1.journal_id.copy().id}
        )
        self.basic_config.payment_method_ids = [(4, extra_cash.id)]
        self.open_new_session()
        with self.assertRaises(ValidationError):
            self._pay_order(
                self.product_220,
                [self._foreign_payment_line(extra_cash, 50.0, self.currency_f)],
            )

    def test_overpayment_change_stays_in_pos_currency(self):
        self.open_new_session()
        rate = 1 / 4.40
        foreign_due = self.currency_f.round(220.0 * rate)
        extra = self.currency_f.round(foreign_due + 0.01)
        pos_amount = self.currency.round(extra / rate)
        order = self._pay_order(
            self.product_220,
            [
                self._foreign_payment_line(
                    self.cash_pm1, extra, self.currency_f, pos_amount=pos_amount
                )
            ],
        )
        change = order.payment_ids.filtered("is_change")
        self.assertTrue(change)
        self.assertFalse(change.foreign_currency_id)
        self.assertEqual(change.payment_method_id, self.cash_pm1)


@tagged("post_install", "-at_install")
class TestPosMultiCurrencySession(TestPosMultiCurrencyCommon):
    def test_worked_example_cash(self):
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )
        method = session._get_cash_control_method()
        self._close_session(
            session,
            cash_count=0,
            foreign_counts=[
                {
                    "payment_method_id": method.id,
                    "currency_id": self.currency_f.id,
                    "amount": 50.0,
                }
            ],
        )
        receivable = session.move_id.line_ids.filtered(
            lambda line: line.currency_id == self.currency_f
            and line.amount_currency == 50.0
        )
        self.assertEqual(len(receivable), 1)
        self.assertAlmostEqual(receivable.debit, 220.0, places=2)
        statement = session.statement_line_ids.filtered(
            lambda line: line.foreign_currency_id == self.currency_f
        )
        self.assertEqual(len(statement), 1)
        company_amount = self.currency_f._convert(
            50.0, self.env.company.currency_id, self.env.company, statement.date
        )
        self.assertAlmostEqual(company_amount, 219.25, places=2)
        self.assertAlmostEqual(statement.amount, company_amount, places=2)
        self.assertEqual(statement.amount_currency, 50.0)
        liquidity = statement.move_id.line_ids.filtered(
            lambda line: line.account_id == statement.journal_id.default_account_id
        )
        self.assertAlmostEqual(liquidity.debit, company_amount, places=2)
        self.assertEqual(liquidity.currency_id, self.env.company.currency_id)
        loss = self.env["account.move.line"].search(
            [
                ("account_id", "=", self.exchange_expense.id),
                ("move_id", "in", session._get_related_account_moves().ids),
            ]
        )
        self.assertAlmostEqual(
            sum(loss.mapped("debit")), 220.0 - company_amount, places=2
        )
        self.assertTrue(receivable.reconciled)

    def test_same_rate_posts_no_exchange(self):
        session = self.open_new_session()
        company_rate = self.env["res.currency"]._get_conversion_rate(
            self.currency,
            self.currency_g,
            self.env.company,
            fields.Date.context_today(self.env.user),
        )
        pos_amount = self.currency.round(10.0 / company_rate)
        product = self.product_220
        product.list_price = pos_amount
        self._pay_order(
            product,
            [
                self._foreign_payment_line(
                    self.cash_pm1,
                    10.0,
                    self.currency_g,
                    rate=company_rate,
                    pos_amount=pos_amount,
                )
            ],
        )
        method = session._get_cash_control_method()
        self._close_session(
            session,
            cash_count=0,
            foreign_counts=[
                {
                    "payment_method_id": method.id,
                    "currency_id": self.currency_g.id,
                    "amount": 10.0,
                }
            ],
        )
        exchange = session._get_related_account_moves().line_ids.filtered(
            lambda line: line.account_id
            in (self.exchange_expense | self.exchange_income)
        )
        self.assertFalse(exchange)

    def test_missing_exchange_journal_rolls_back(self):
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )
        self.env.company.currency_exchange_journal_id = False
        with self.assertRaises(UserError) as error:
            session.action_pos_session_closing_control()
        self.assertIn("Exchange Gain or Loss Journal", str(error.exception))
        session.invalidate_recordset()
        self.assertFalse(session.move_id.line_ids)

    def test_journal_items_include_the_exchange_move(self):
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.bank_pm1, 50.0, self.currency_f)],
        )
        self._close_session(
            session,
            cash_count=0,
            foreign_counts=[
                {
                    "payment_method_id": self.bank_pm1.id,
                    "currency_id": self.currency_f.id,
                    "amount": 50.0,
                }
            ],
        )
        moves = session._get_related_account_moves()
        exchange = moves.line_ids.filtered(
            lambda line: line.account_id == self.exchange_expense
        )
        self.assertTrue(exchange)
        self.assertIn(exchange.move_id, moves)

    def test_mixed_bank_tenders_reconcile_with_exchange(self):
        """Same bank method: Point of Sale currency and foreign in one session."""
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [
                (
                    0,
                    0,
                    {
                        "amount": 220.0,
                        "name": fields.Datetime.to_string(fields.Datetime.now()),
                        "payment_method_id": self.bank_pm1.id,
                    },
                )
            ],
        )
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.bank_pm1, 50.0, self.currency_f)],
        )
        self._close_session(
            session,
            cash_count=0,
            foreign_counts=[
                {
                    "payment_method_id": self.bank_pm1.id,
                    "currency_id": self.currency_f.id,
                    "amount": 50.0,
                }
            ],
        )
        receivable = session._get_receivable_account(self.bank_pm1)
        payments = self.env["account.payment"].search(
            [("pos_session_id", "=", session.id)]
        )
        self.assertEqual(len(payments), 2)
        pay_lines = payments.move_id.line_ids.filtered(
            lambda line: line.account_id == receivable
        )
        session_lines = session.move_id.line_ids.filtered(
            lambda line: line.account_id == receivable
        )
        self.assertEqual(len(pay_lines), 2)
        self.assertEqual(len(session_lines), 2)
        self.assertTrue(all(pay_lines.mapped("reconciled")))
        self.assertTrue(all(session_lines.mapped("reconciled")))
        exchange = session._get_related_account_moves().line_ids.filtered(
            lambda line: line.account_id == self.exchange_expense
        )
        self.assertTrue(exchange)

    def test_pos_currency_cash_ignores_foreign_tenders(self):
        session = self.open_new_session(opening_cash=100)
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )
        data = session.get_closing_control_data()
        self.assertAlmostEqual(
            data["default_cash_details"]["payment_amount"], 0.0, places=2
        )
        # Counted opening is cash_register_balance_start. Core also posts it
        # as a statement line; pos_cash_control_extension does not. The
        # closing total must still match the counted opening when there is
        # no Point of Sale currency cash payment or cash move.
        self.assertAlmostEqual(
            data["default_cash_details"]["amount"],
            session.cash_register_balance_start,
            places=2,
        )

    def test_closing_data_keeps_pay_later(self):
        self.basic_config.payment_method_ids = [(4, self.pay_later_pm.id)]
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [
                (
                    0,
                    0,
                    {
                        "amount": 220.0,
                        "name": fields.Datetime.to_string(fields.Datetime.now()),
                        "payment_method_id": self.pay_later_pm.id,
                    },
                )
            ],
            partner=self.customer,
        )
        data = session.get_closing_control_data()
        pay_later = next(
            row
            for row in data["other_payment_methods"]
            if row["id"] == self.pay_later_pm.id
        )
        self.assertAlmostEqual(pay_later["amount"], 220.0, places=2)
        self.assertEqual(pay_later["number"], 1)


@tagged("post_install", "-at_install")
class TestPosMultiCurrencyCashControl(TestPosMultiCurrencyCommon):
    def test_opening_difference_uses_suspense(self):
        session = self._session_opening_control()
        session.set_foreign_opening(
            [{"currency_id": self.currency_f.id, "amount": 20.0}]
        )
        line = session.statement_line_ids.filtered(
            lambda item: item.foreign_currency_id == self.currency_f
        )
        self.assertEqual(line.amount_currency, 20.0)
        suspense = line.journal_id.suspense_account_id
        counterpart = line.move_id.line_ids.filtered(
            lambda aml: aml.account_id == suspense
        )
        self.assertTrue(counterpart)

    def test_foreign_opening_is_idempotent(self):
        session = self._session_opening_control()
        counts = [{"currency_id": self.currency_f.id, "amount": 20.0}]
        session.set_foreign_opening(counts)
        session.set_foreign_opening(counts)
        lines = session.statement_line_ids.filtered(
            lambda item: item.foreign_currency_id == self.currency_f
        )
        self.assertEqual(len(lines), 1)
        self.assertEqual(lines.amount_currency, 20.0)

    def test_foreign_opening_refuses_an_opened_session(self):
        session = self.open_new_session()
        with self.assertRaises(UserError):
            session.set_foreign_opening(
                [{"currency_id": self.currency_f.id, "amount": 5.0}]
            )

    def test_closing_counts_reject_unknown_method_or_currency(self):
        session = self.open_new_session()
        method = session._get_cash_control_method()
        with self.assertRaises(UserError):
            session.set_foreign_closing_counts(
                [
                    {
                        "payment_method_id": method.id,
                        "currency_id": self.env.company.currency_id.id,
                        "amount": 1.0,
                    }
                ]
            )
        other_bank = self.bank_pm1.copy(
            default={
                "name": "Other bank",
                "journal_id": self.bank_pm1.journal_id.copy().id,
            }
        )
        with self.assertRaises(UserError):
            session.set_foreign_closing_counts(
                [
                    {
                        "payment_method_id": other_bank.id,
                        "currency_id": self.currency_f.id,
                        "amount": 1.0,
                    }
                ]
            )

    def test_closing_counts_reject_a_closed_session(self):
        session = self.open_new_session()
        self._close_session(session, cash_count=0)
        method = session._get_cash_control_method()
        with self.assertRaises(UserError):
            session.set_foreign_closing_counts(
                [
                    {
                        "payment_method_id": method.id,
                        "currency_id": self.currency_f.id,
                        "amount": 1.0,
                    }
                ]
            )

    def test_cash_in_foreign_currency(self):
        session = self.open_new_session()
        session.try_cash_in_out(
            "in",
            15.0,
            "float",
            {
                "translatedType": "in",
                "formattedAmount": "15.00 F",
                "currency_id": self.currency_f.id,
            },
        )
        line = session.statement_line_ids.filtered(
            lambda item: item.foreign_currency_id == self.currency_f
        )
        self.assertEqual(line.amount_currency, 15.0)
        self.assertTrue(session._is_foreign_drawer_line(line))

    def test_cashier_cannot_post_a_foreign_cash_move(self):
        session = self.open_new_session()
        cashier = self.env["res.users"].create(
            {
                "name": "POS cashier cash move",
                "login": "pos_cashier_cash_move",
                "groups_id": [
                    (
                        6,
                        0,
                        [
                            self.env.ref("base.group_user").id,
                            self.env.ref("point_of_sale.group_pos_user").id,
                        ],
                    )
                ],
            }
        )
        with self.assertRaises(AccessError):
            session.with_user(cashier).try_cash_in_out(
                "in",
                15.0,
                "float",
                {
                    "translatedType": "in",
                    "formattedAmount": "15.00 F",
                    "currency_id": self.currency_f.id,
                },
            )

    def test_unknown_currency_is_refused(self):
        session = self.open_new_session()
        other = self.env["res.currency"].create(
            {"name": "ZZZ", "symbol": "Z", "rounding": 0.01}
        )
        with self.assertRaises(UserError):
            session.try_cash_in_out(
                "in",
                5.0,
                "nope",
                {
                    "translatedType": "in",
                    "formattedAmount": "5",
                    "currency_id": other.id,
                },
            )

    def test_closing_cash_difference(self):
        session = self.open_new_session()
        method = session._get_cash_control_method()
        self._close_session(
            session,
            cash_count=0,
            foreign_counts=[
                {
                    "payment_method_id": method.id,
                    "currency_id": self.currency_f.id,
                    "amount": 3.0,
                }
            ],
        )
        line = session.statement_line_ids.filtered(
            lambda item: item.foreign_currency_id == self.currency_f
        )
        self.assertEqual(line.amount_currency, 3.0)
        self.assertEqual(
            line.move_id.line_ids.account_id,
            line.journal_id.default_account_id | line.journal_id.profit_account_id,
        )

    def test_bank_difference_move(self):
        journal = self.bank_pm1.journal_id.copy(
            {"name": "Currency difference bank", "code": "CDB"}
        )
        journal.write(
            {
                "profit_account_id": self.company_data["default_account_revenue"]
                .copy()
                .id,
                "loss_account_id": self.company_data["default_account_expense"]
                .copy()
                .id,
            }
        )
        self.bank_pm1.currency_difference_journal_id = journal
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.bank_pm1, 50.0, self.currency_f)],
        )
        self._close_session(
            session,
            cash_count=0,
            foreign_counts=[
                {
                    "payment_method_id": self.bank_pm1.id,
                    "currency_id": self.currency_f.id,
                    "amount": 47.0,
                }
            ],
        )
        balance = session._get_currency_balance(self.bank_pm1, self.currency_f)
        self.assertTrue(balance.difference_move_id)
        self.assertEqual(balance.difference_move_id.journal_id, journal)
        self.assertTrue(
            balance.difference_move_id.line_ids.filtered(
                lambda line: line.currency_id == self.currency_f
            )
        )
        moves = session._get_related_account_moves()
        self.assertIn(balance.difference_move_id, moves)


@tagged("post_install", "-at_install")
class TestPosMultiCurrencyRefund(TestPosMultiCurrencyCommon):
    def test_refund_uses_the_refund_day_rate(self):
        session = self.open_new_session()
        order = self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )
        method = session._get_cash_control_method()
        self._close_session(
            session,
            cash_count=0,
            foreign_counts=[
                {
                    "payment_method_id": method.id,
                    "currency_id": self.currency_f.id,
                    "amount": 50.0,
                }
            ],
        )
        opening_loaded = session._get_pos_ui_foreign_currencies()
        opening_rate = next(
            row["rate"] for row in opening_loaded if row["id"] == self.currency_f.id
        )
        self.assertAlmostEqual(
            opening_rate, session._pos_rate(self.currency_f), places=6
        )
        self.currency_f.rate_ids.rate = 1 / 4.00
        refund_session = self.open_new_session()
        loaded = refund_session._get_pos_ui_foreign_currencies()
        refund_rate = next(
            row["rate"] for row in loaded if row["id"] == self.currency_f.id
        )
        self.assertAlmostEqual(refund_rate, 0.25, places=6)
        self.assertAlmostEqual(
            refund_session._pos_rate(self.currency_f), refund_rate, places=6
        )
        self.assertNotAlmostEqual(refund_rate, opening_rate, places=6)
        refund = self._pay_order(
            self.product_220,
            [
                self._foreign_payment_line(
                    self.cash_pm1,
                    -55.0,
                    self.currency_f,
                    rate=refund_rate,
                    pos_amount=-220.0,
                )
            ],
            quantity=-1,
        )
        # A refund order is a negative quantity. The payment stores the
        # refund-day rate the POS loaded and does not rewrite the original.
        self.assertEqual(order.payment_ids.amount_currency, 50.0)
        self.assertAlmostEqual(
            order.payment_ids.foreign_currency_rate,
            self._pos_rate(self.currency_f),
            places=6,
        )
        self.assertEqual(refund.payment_ids.amount_currency, -55.0)
        self.assertAlmostEqual(
            refund.payment_ids.foreign_currency_rate, refund_rate, places=6
        )

    def test_negative_foreign_bank_tender_reconciles_once(self):
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [
                self._foreign_payment_line(
                    self.bank_pm1,
                    -50.0,
                    self.currency_f,
                    pos_amount=-220.0,
                )
            ],
            quantity=-1,
        )
        self._close_session(
            session,
            cash_count=0,
            foreign_counts=[
                {
                    "payment_method_id": self.bank_pm1.id,
                    "currency_id": self.currency_f.id,
                    "amount": -50.0,
                }
            ],
        )
        receivable = session._get_receivable_account(self.bank_pm1)
        payment = self.env["account.payment"].search(
            [("pos_session_id", "=", session.id)]
        )
        self.assertEqual(len(payment), 1)
        pay_line = payment.move_id.line_ids.filtered(
            lambda line: line.account_id == receivable
        )
        session_line = session.move_id.line_ids.filtered(
            lambda line: line.account_id == receivable
        )
        self.assertEqual(len(pay_line), 1)
        self.assertEqual(len(session_line), 1)
        self.assertTrue(pay_line.reconciled)
        self.assertTrue(session_line.reconciled)
        outstanding = self.bank_pm1.outstanding_account_id
        outstanding_lines = (payment.move_id | session.move_id).line_ids.filtered(
            lambda line: line.account_id == outstanding
        )
        self.assertEqual(len(outstanding_lines), 1)

    def test_backend_refund_wizard_stays_in_pos_currency(self):
        self.open_new_session()
        order = self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )
        refund = order._refund()
        wizard = (
            self.env["pos.make.payment"]
            .with_context(active_id=refund.id)
            .create(
                {"amount": refund.amount_total, "payment_method_id": self.cash_pm1.id}
            )
        )
        wizard.check()
        payment = refund.payment_ids
        self.assertFalse(payment.foreign_currency_id)
        self.assertAlmostEqual(payment.amount, refund.amount_total, places=2)


@tagged("post_install", "-at_install")
class TestPosMultiCurrencyReport(TestPosMultiCurrencyCommon):
    def test_sale_details_separates_foreign_tenders(self):
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )
        data = self.env["report.point_of_sale.report_saledetails"].get_sale_details(
            session_ids=[session.id]
        )
        cash_rows = [row for row in data["payments"] if row.get("cash")]
        self.assertTrue(cash_rows)
        self.assertAlmostEqual(cash_rows[0]["total"], 0.0, places=2)
        foreign = data["foreign_currencies"]
        self.assertEqual(len(foreign), 1)
        self.assertEqual(foreign[0]["currency"], "F")
        self.assertAlmostEqual(foreign[0]["tendered"], 50.0, places=2)
        self.assertAlmostEqual(foreign[0]["pos_amount"], 220.0, places=2)
        self.assertIn("0.227273", foreign[0]["rate"])
        self.assertEqual(foreign[0]["decimals"], self.currency_f.decimal_places)


@tagged("post_install", "-at_install")
class TestPosMultiCurrencySecurity(TestPosMultiCurrencyCommon):
    def test_cashier_cannot_delete_a_balance(self):
        session = self.open_new_session()
        method = session._get_cash_control_method()
        balance = session._get_currency_balance(method, self.currency_f, create=True)
        cashier = self.env["res.users"].create(
            {
                "name": "POS cashier",
                "login": "pos_cashier_currency",
                "groups_id": [
                    (6, 0, [self.env.ref("point_of_sale.group_pos_user").id])
                ],
            }
        )
        balance.with_user(cashier).read(["balance_start"])
        with self.assertRaises(AccessError), mute_logger(
            "odoo.addons.base.models.ir_model"
        ):
            balance.with_user(cashier).unlink()

    def test_cashier_posts_and_reads_a_foreign_opening(self):
        session = self._session_opening_control()
        cashier = self.env["res.users"].create(
            {
                "name": "POS cashier opening",
                "login": "pos_cashier_opening",
                "groups_id": [
                    (
                        6,
                        0,
                        [
                            self.env.ref("base.group_user").id,
                            self.env.ref("point_of_sale.group_pos_user").id,
                        ],
                    )
                ],
            }
        )
        session.with_user(cashier).set_foreign_opening(
            [{"currency_id": self.currency_f.id, "amount": 5.0}]
        )
        session.set_cashbox_pos(0, None)
        session.invalidate_recordset()
        admin_lines = session.statement_line_ids.filtered(
            lambda item: item.foreign_currency_id == self.currency_f
        )
        self.assertEqual(admin_lines.mapped("amount_currency"), [5.0])
        self.assertTrue(session._is_foreign_drawer_line(admin_lines))
        self.assertEqual(
            session.with_user(cashier).statement_line_ids.ids,
            admin_lines.ids,
        )
        expected = session.with_user(cashier).get_foreign_cash_expected()
        self.assertAlmostEqual(expected[self.currency_f.id], 5.0, places=2)
        closing = session.with_user(cashier).get_foreign_closing_data()
        cash = next(
            row
            for row in closing
            if row["currency_id"] == self.currency_f.id and row["type"] == "cash"
        )
        self.assertAlmostEqual(cash["expected"], 5.0, places=2)

    def test_balance_is_unique(self):
        session = self.open_new_session()
        method = session._get_cash_control_method()
        values = {
            "session_id": session.id,
            "payment_method_id": method.id,
            "currency_id": self.currency_f.id,
        }
        self.env["pos.session.currency.balance"].create(values)
        with self.assertRaises(IntegrityError), mute_logger("odoo.sql_db"):
            with self.env.cr.savepoint():
                self.env["pos.session.currency.balance"].create(values)


@tagged("post_install", "-at_install")
class TestPosMultiCurrencyHooks(TestPosMultiCurrencyCommon):
    def test_rate_format(self):
        session_model = self.env["pos.session"]
        self.assertEqual(session_model._format_foreign_rate(1 / 4.40), "0.227273")
        self.assertEqual(session_model._format_foreign_rate(0.25), "0.25")
        self.assertEqual(session_model._format_foreign_rate(10), "10")
        self.assertEqual(session_model._format_foreign_rate(100000), "100,000")

    def test_prepare_hooks_return_the_tender(self):
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )
        group = session._collect_foreign_payment_groups()[0]
        receivable = session._prepare_foreign_receivable_vals(group)
        statement = session._prepare_foreign_statement_line_vals(group)
        self.assertEqual(receivable["amount_currency"], 50.0)
        self.assertEqual(receivable["currency_id"], self.currency_f.id)
        self.assertEqual(statement["foreign_currency_id"], self.currency_f.id)
        self.assertEqual(statement["amount_currency"], 50.0)
        self.assertEqual(
            session._get_foreign_payment_date(group["payments"]), statement["date"]
        )

    def test_loaded_currencies_keep_the_pos_currency_dict(self):
        session = self.open_new_session()
        loaded = session._get_pos_ui_foreign_currencies()
        self.assertEqual([currency["name"] for currency in loaded], ["F", "G", "H"])
        self.assertTrue(session._get_cash_control_method())


@tagged("post_install", "-at_install")
class TestPosMultiCurrencyRescue(TestPosMultiCurrencyCommon):
    def test_rescue_carries_the_counted_closing(self):
        session = self.open_new_session()
        method = session._get_cash_control_method()
        self._close_session(
            session,
            cash_count=0,
            foreign_counts=[
                {
                    "payment_method_id": method.id,
                    "currency_id": self.currency_f.id,
                    "amount": 12.0,
                }
            ],
        )
        with mute_logger("odoo.addons.point_of_sale.models.pos_order"):
            rescue = self.env["pos.order"]._get_valid_session(
                {
                    "pos_session_id": session.id,
                    "name": "Order rescue",
                    "amount_total": 0,
                }
            )
        row = rescue._get_currency_balance(method, self.currency_f)
        self.assertAlmostEqual(row.balance_start, 12.0, places=2)
        self.assertFalse(
            rescue.statement_line_ids.filtered(
                lambda line: line.foreign_currency_id == self.currency_f
            )
        )
