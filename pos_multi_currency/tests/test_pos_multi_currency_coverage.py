# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from unittest.mock import patch

from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.tests import tagged
from odoo.tools import mute_logger

from .common import TestPosMultiCurrencyCommon


@tagged("post_install", "-at_install")
class TestPosMultiCurrencyCoverage(TestPosMultiCurrencyCommon):
    def test_rate_format_edges(self):
        session = self.env["pos.session"]
        self.assertEqual(session._round_foreign_rate(0), 0.0)
        self.assertEqual(session._format_foreign_rate(0), "0")
        negative = session.with_context(lang="en_US")._format_foreign_rate(-1234.5)
        self.assertTrue(negative.startswith("-"))
        self.assertIn(",", negative)
        plain = session.with_context(lang="zz_ZZ")._format_foreign_rate(-1.5)
        self.assertEqual(plain, "-1.5")

    def test_currency_list_accepts_a_tuple_and_a_link(self):
        config = self.basic_config
        config.write({"foreign_currency_ids": (self.currency_f.id, self.currency_g.id)})
        self.assertEqual(
            set(config.foreign_currency_ids.ids),
            {self.currency_f.id, self.currency_g.id},
        )
        config.write({"foreign_currency_ids": [(4, self.currency_h.id)]})
        self.assertIn(self.currency_h, config.foreign_currency_ids)

    def test_difference_journal_must_match_the_company(self):
        other = self.company_data_2["company"]
        journal = (
            self.env["account.journal"]
            .with_company(other)
            .create(
                {
                    "name": "Other company cash",
                    "code": "OCSH",
                    "type": "cash",
                    "company_id": other.id,
                }
            )
        )
        with self.assertRaises(ValidationError):
            self.bank_pm1.currency_difference_journal_id = journal

    def _paid_order(self):
        self.open_new_session()
        return self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )

    def _foreign_payment_vals(self, order, **extra):
        vals = {
            "pos_order_id": order.id,
            "payment_method_id": self.bank_pm1.id,
            "amount": 10.0,
            "foreign_currency_id": self.currency_g.id,
            "amount_currency": 2.5,
            "foreign_currency_rate": 0.25,
        }
        vals.update(extra)
        return vals

    @mute_logger("odoo.addons.point_of_sale.models.pos_order")
    def test_incomplete_tender_is_refused(self):
        order = self._paid_order()
        with self.assertRaises(ValidationError):
            self.env["pos.payment"].create(
                self._foreign_payment_vals(
                    order,
                    foreign_currency_id=self.currency_g.id,
                    amount_currency=0.0,
                    foreign_currency_rate=0.0,
                )
            )

    @mute_logger("odoo.addons.point_of_sale.models.pos_order")
    def test_tender_currency_must_differ_from_the_pos_currency(self):
        order = self._paid_order()
        with self.assertRaises(ValidationError):
            self.env["pos.payment"].create(
                self._foreign_payment_vals(
                    order,
                    foreign_currency_id=order.currency_id.id,
                    amount_currency=10.0,
                    foreign_currency_rate=1.0,
                )
            )

    @mute_logger("odoo.addons.point_of_sale.models.pos_order")
    def test_unlisted_currency_is_refused(self):
        order = self._paid_order()
        other = self._create_foreign_currency("Z", 2.0)
        with self.assertRaises(ValidationError):
            self.env["pos.payment"].create(
                self._foreign_payment_vals(
                    order,
                    foreign_currency_id=other.id,
                    amount_currency=20.0,
                    foreign_currency_rate=2.0,
                )
            )

    @mute_logger("odoo.addons.point_of_sale.models.pos_order")
    def test_pos_currency_must_be_the_company_currency(self):
        order = self._paid_order()
        journal = order.config_id.journal_id
        journal.currency_id = self.currency_h
        order.config_id.invalidate_recordset()
        with self.assertRaises(ValidationError):
            self.env["pos.payment"].create(self._foreign_payment_vals(order))

    @mute_logger("odoo.addons.point_of_sale.models.pos_order")
    def test_terminal_change_and_status_are_refused(self):
        order = self._paid_order()
        self.env.cr.execute(
            "UPDATE pos_payment_method SET use_payment_terminal = 'dummy' "
            "WHERE id = %s",
            [self.bank_pm1.id],
        )
        self.bank_pm1.invalidate_recordset()
        with self.assertRaises(ValidationError):
            self.env["pos.payment"].create(self._foreign_payment_vals(order))
        self.env.cr.execute(
            "UPDATE pos_payment_method SET use_payment_terminal = NULL WHERE id = %s",
            [self.bank_pm1.id],
        )
        self.bank_pm1.invalidate_recordset()
        with self.assertRaises(ValidationError):
            self.env["pos.payment"].create(
                self._foreign_payment_vals(order, is_change=True)
            )
        with self.assertRaises(ValidationError):
            self.env["pos.payment"].create(
                self._foreign_payment_vals(order, payment_status="done")
            )
        with self.assertRaises(ValidationError):
            self.env["pos.payment"].create(
                self._foreign_payment_vals(order, amount_currency=-2.5)
            )

    def test_sale_details_without_a_session_list(self):
        report = self.env["report.point_of_sale.report_saledetails"]
        report._sale_details_orders(False, False, False, False)
        report._sale_details_orders(
            "2020-01-02 00:00:00",
            "2020-01-01 00:00:00",
            [self.basic_config.id],
            False,
        )
        self.basic_config.payment_method_ids = [(6, 0, [self.bank_pm1.id])]
        session = self.open_new_session()
        order = self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.bank_pm1, 50.0, self.currency_f)],
        )
        sections = report._foreign_sale_details(order, order.payment_ids)
        self.assertEqual(sections[0]["banks"][0]["name"], self.bank_pm1.name)
        self.assertFalse(sections[0]["drawers"])
        report._exclude_foreign_payments(
            {"payments": [{}]},
            order.payment_ids,
        )
        report._exclude_foreign_bank_counted({"id": self.bank_pm1.id}, session)
        row = {"id": self.bank_pm1.id, "money_counted": 10.0}
        report._exclude_foreign_bank_counted(row, session)
        self.assertEqual(row["money_counted"], 0.0)
        session.invalidate_recordset(["cash_register_total_entry_encoding"])
        session._compute_cash_balance()

    def test_opening_and_closing_guards(self):
        session = self._session_opening_control()
        outsider = self.env["res.users"].create(
            {
                "name": "No POS",
                "login": "no_pos_currency_coverage",
                "groups_id": [(6, 0, [self.env.ref("base.group_user").id])],
            }
        )
        with self.assertRaises(AccessError):
            session.with_user(outsider).get_foreign_opening_data()
        with self.assertRaises(UserError):
            session.set_foreign_opening(
                [
                    {
                        "currency_id": self._create_foreign_currency("Z", 2).id,
                        "amount": 1,
                    }
                ]
            )
        session._set_foreign_rescue_opening()
        empty = self.env["pos.payment.method"]
        with patch.object(
            type(session), "_get_cash_control_method", return_value=empty
        ):
            self.assertTrue(session.set_foreign_opening([]))
            self.assertEqual(session._foreign_cash_expected(self.currency_f), 0.0)
            session._set_foreign_rescue_closing()

    def test_closing_refuses_draft_orders_and_a_closed_session(self):
        session = self.open_new_session()
        self.env["pos.order"].create(
            {
                "session_id": session.id,
                "amount_tax": 0.0,
                "amount_total": 1.0,
                "amount_paid": 0.0,
                "amount_return": 0.0,
            }
        )
        with self.assertRaises(UserError):
            session.action_pos_session_closing_control()
        draft = session.order_ids.filtered(lambda order: order.state == "draft")
        draft.write({"state": "cancel"})
        closed = self._close_session(session, cash_count=0)
        with self.assertRaises(UserError):
            closed.action_pos_session_closing_control()

    def test_previous_opening_without_a_balance_is_zero(self):
        first = self.open_new_session()
        self._close_session(first, cash_count=0)
        session = self._session_opening_control()
        data = session.get_foreign_opening_data()
        self.assertTrue(all(row["expected"] == 0.0 for row in data))
        session.set_foreign_opening(
            [{"currency_id": self.currency_h.id, "amount": 0.0}]
        )
        row = session._get_currency_balance(
            session._get_cash_control_method(), self.currency_h
        )
        self.assertEqual(row.balance_start, 0.0)

    def test_bank_closing_and_extra_cash_method(self):
        self.basic_config.payment_method_ids = [
            (6, 0, [self.cash_pm1.id, self.cash_split_pm1.id, self.bank_pm1.id])
        ]
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.bank_pm1, 50.0, self.currency_f)],
        )
        rows = session.get_foreign_closing_data()
        self.assertTrue(any(row["type"] == "bank" for row in rows))
        session.set_foreign_closing_counts(
            [
                {
                    "payment_method_id": self.cash_split_pm1.id,
                    "currency_id": self.currency_f.id,
                    "amount": 5.0,
                }
            ]
        )
        self.assertFalse(
            session.currency_balance_ids.filtered(
                lambda balance: balance.payment_method_id == self.cash_split_pm1
            )
        )

    def test_cash_moves_and_difference_accounts(self):
        session = self.open_new_session()
        session.try_cash_in_out("in", 5.0, "float", {"translatedType": "in"})
        session._post_foreign_cash_difference_line(self.currency_f, 0.0)
        journal = session.cash_journal_id
        loss = journal.loss_account_id
        profit = journal.profit_account_id
        journal.loss_account_id = False
        with self.assertRaises(UserError):
            session._post_foreign_cash_difference_line(self.currency_f, -1.0)
        journal.loss_account_id = loss
        journal.profit_account_id = False
        with self.assertRaises(UserError):
            session._post_foreign_cash_difference_line(self.currency_f, 1.0)
        journal.profit_account_id = profit
        method = session._get_cash_control_method()
        balance = session._get_currency_balance(method, self.currency_f, create=True)
        balance.balance_end_real = 4.0
        journal.profit_account_id = False
        with self.assertRaises(UserError):
            session._check_foreign_difference_accounts()
        journal.profit_account_id = profit
        balance.balance_end_real = -4.0
        journal.loss_account_id = False
        with self.assertRaises(UserError):
            session._check_foreign_difference_accounts()
        journal.loss_account_id = loss
        bank = session._get_currency_balance(
            self.bank_pm1, self.currency_g, create=True
        )
        self.assertEqual(session._prepare_foreign_difference_vals(bank), {})
        session._post_foreign_bank_difference(bank)
        bank.balance_end_real = 3.0
        vals = session._prepare_foreign_difference_vals(bank)
        self.assertEqual(
            vals["line_ids"][1][2]["account_id"],
            self.bank_pm1.journal_id.profit_account_id.id,
        )
        line = self.env["account.bank.statement.line"].new(
            {"journal_id": journal.id, "amount": 1.0}
        )
        self.assertFalse(session._is_foreign_drawer_line(line))

    def test_foreign_cash_move_needs_a_cash_journal(self):
        self.basic_config.payment_method_ids = [(6, 0, [self.bank_pm1.id])]
        session = self.open_new_session()
        with self.assertRaises(UserError):
            session.try_cash_in_out(
                "in",
                1.0,
                "foreign",
                {"currency_id": self.currency_f.id, "translatedType": "in"},
            )

    def test_missing_exchange_accounts(self):
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )
        company = self.env.company
        company.income_currency_exchange_account_id = False
        company.expense_currency_exchange_account_id = False
        missing = session._missing_exchange_accounts()
        self.assertEqual(len(missing), 2)
        result = session._cannot_close_session()
        self.assertFalse(result["successful"])

    def test_closed_cash_balance_ignores_foreign_tenders(self):
        session = self.open_new_session()
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_pm1, 50.0, self.currency_f)],
        )
        self._close_session(session, cash_count=0)
        session.invalidate_recordset(["cash_register_total_entry_encoding"])
        self.assertAlmostEqual(
            session.cash_register_total_entry_encoding, 0.0, places=2
        )

    def test_bank_only_session_closes_without_a_drawer(self):
        self.basic_config.payment_method_ids = [(6, 0, [self.bank_pm1.id])]
        session = self.open_new_session()
        result = session.action_pos_session_closing_control()
        self.assertTrue(result)
        self.assertFalse(session._get_related_account_moves().line_ids)

    def test_rescue_close_counts_foreign_drawers_at_expected(self):
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
                    "name": "Order rescue coverage",
                    "amount_total": 0,
                }
            )
        rescue.action_pos_session_closing_control()
        row = rescue._get_currency_balance(method, self.currency_f)
        self.assertAlmostEqual(row.balance_end_real, row.expected_balance, places=2)
        plain = self._session_opening_control()
        plain._set_foreign_rescue_opening()
        plain._set_foreign_rescue_closing()

    def test_split_tenders_book_the_partner(self):
        self.basic_config.payment_method_ids = [
            (6, 0, [self.cash_split_pm1.id, self.bank_split_pm1.id])
        ]
        session = self.open_new_session()
        partner = self.env["res.partner"].create({"name": "Split tender customer"})
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.cash_split_pm1, 50.0, self.currency_f)],
            partner=partner,
        )
        self._pay_order(
            self.product_220,
            [self._foreign_payment_line(self.bank_split_pm1, 55.0, self.currency_g)],
            partner=partner,
        )
        self._close_session(session, cash_count=0)
        self.assertEqual(session.state, "closed")

    def test_difference_helpers_fill_empty_accounts(self):
        journal = self.cash_pm1.journal_id
        journal.profit_account_id = False
        journal.loss_account_id = False
        self._configure_cash_difference_accounts()
        self.assertTrue(journal.profit_account_id)
        self.assertTrue(journal.loss_account_id)

    def test_close_reads_the_expected_cash_when_no_count_is_given(self):
        session = self.open_new_session()
        self._close_session(session)
        self.assertEqual(session.state, "closed")
