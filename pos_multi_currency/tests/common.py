# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


class TestPosMultiCurrencyCommon(TestPoSCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)
        cls.currency_f = cls._create_foreign_currency("F", 1 / 4.385)
        cls.currency_g = cls._create_foreign_currency("G", 0.25)
        cls.currency_h = cls._create_foreign_currency("H", 10)
        cls._configure_exchange_accounts()
        cls._configure_cash_difference_accounts()
        cls.basic_config.write(
            {
                "payment_method_ids": [(6, 0, [cls.cash_pm1.id, cls.bank_pm1.id])],
                "foreign_currency_ids": [
                    (6, 0, [cls.currency_f.id, cls.currency_g.id, cls.currency_h.id])
                ],
            }
        )
        cls.product_220 = cls.env["product.product"].create(
            {
                "name": "Foreign tender product",
                "available_in_pos": True,
                "list_price": 220.0,
                "taxes_id": [(5, 0, 0)],
                "type": "consu",
            }
        )

    @classmethod
    def _create_foreign_currency(cls, name, rate):
        return cls.env["res.currency"].create(
            {
                "name": name,
                "symbol": name,
                "rounding": 0.01,
                "rate_ids": [
                    (
                        0,
                        0,
                        {
                            "rate": rate,
                            "name": fields.Date.today(),
                            "company_id": cls.env.company.id,
                        },
                    )
                ],
            }
        )

    @classmethod
    def _configure_exchange_accounts(cls):
        company = cls.env.company
        income = cls.company_data["default_account_revenue"].copy()
        expense = cls.company_data["default_account_expense"].copy()
        company.write(
            {
                "currency_exchange_journal_id": cls.company_data[
                    "default_journal_misc"
                ].id,
                "income_currency_exchange_account_id": income.id,
                "expense_currency_exchange_account_id": expense.id,
            }
        )
        cls.exchange_income = income
        cls.exchange_expense = expense

    @classmethod
    def _configure_cash_difference_accounts(cls):
        journals = cls.env["account.journal"]
        for method in (
            cls.cash_pm1,
            cls.bank_pm1,
            cls.cash_split_pm1,
            cls.bank_split_pm1,
        ):
            journals |= method.journal_id
        for journal in journals:
            if not journal.profit_account_id:
                journal.profit_account_id = cls.company_data[
                    "default_account_revenue"
                ].copy()
            if not journal.loss_account_id:
                journal.loss_account_id = cls.company_data[
                    "default_account_expense"
                ].copy()

    def setUp(self):
        super().setUp()
        self.config = self.basic_config

    def _session_opening_control(self):
        """Open a session and leave it in ``opening_control`` for foreign counts."""
        self.config.open_ui()
        self.pos_session = self.config.current_session_id
        self.currency = self.pos_session.currency_id
        self.pricelist = self.pos_session.config_id.pricelist_id
        return self.pos_session

    def _pos_rate(self, currency):
        return 1 / 4.40 if currency == self.currency_f else currency.rate

    def _foreign_payment_line(
        self, method, amount_currency, currency, rate=None, pos_amount=None
    ):
        rate = self._pos_rate(currency) if rate is None else rate
        if pos_amount is None:
            due = self.currency.round(amount_currency / rate)
            pos_amount = due
        return (
            0,
            0,
            {
                "amount": pos_amount,
                "name": fields.Datetime.to_string(fields.Datetime.now()),
                "payment_method_id": method.id,
                "foreign_currency_id": currency.id,
                "amount_currency": amount_currency,
                "foreign_currency_rate": rate,
            },
        )

    def _pay_order(self, product, payments, invoiced=False, partner=False, quantity=1):
        data = self.create_ui_order_data(
            [(product, quantity)],
            customer=partner,
            is_invoiced=invoiced,
            payments=[(self.cash_pm1, 0.0)],
        )
        data["data"]["statement_ids"] = payments
        paid = sum(payment[2]["amount"] for payment in payments)
        total = data["data"]["amount_total"]
        data["data"]["amount_paid"] = min(paid, total)
        data["data"]["amount_return"] = max(paid - total, 0.0)
        created = self.env["pos.order"].create_from_ui([data])
        return self.env["pos.order"].browse(created[0]["id"])

    def _close_session(self, session, cash_count=None, foreign_counts=None):
        if foreign_counts:
            session.set_foreign_closing_counts(foreign_counts)
        if session.config_id.cash_control:
            if cash_count is None:
                session.invalidate_recordset()
                cash_count = session.cash_register_balance_end
            session.post_closing_cash_details(cash_count)
        result = session.close_session_from_ui()
        self.assertTrue(result["successful"])
        return session
