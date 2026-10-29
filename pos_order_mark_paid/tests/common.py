# Copyright 2026 Cetmix OÜ
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


class TestMarkPaidCommon(TestPoSCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)
        cls.write_off_account = cls.env["account.account"].create(
            {
                "code": "WOFF01",
                "name": "POS Write-off",
                "account_type": "expense",
            }
        )
        cls.rounding_loss_account = cls.env["account.account"].create(
            {"code": "RLOSS1", "name": "Rounding Loss", "account_type": "expense"}
        )
        cls.rounding_profit_account = cls.env["account.account"].create(
            {
                "code": "RPROF1",
                "name": "Rounding Profit",
                "account_type": "income_other",
            }
        )
        cls.cash_rounding = cls.env["account.cash.rounding"].create(
            {
                "name": "Rounding 0.05",
                "rounding": 0.05,
                "rounding_method": "HALF-UP",
                "strategy": "add_invoice_line",
                "profit_account_id": cls.rounding_profit_account.id,
                "loss_account_id": cls.rounding_loss_account.id,
            }
        )
        cls.basic_config.write(
            {
                "mark_paid_enabled": True,
                "mark_paid_account_id": cls.write_off_account.id,
                "mark_paid_max_amount": 1.0,
                "mark_paid_max_percent": 5.0,
                "mark_paid_label": "Extra discount",
            }
        )
        cls.product_10007 = cls.create_product(
            "Product 100.07", cls.categ_basic, 100.07
        )
        cls.product_1007 = cls.create_product("Product 10.07", cls.categ_basic, 10.07)
        cls.product_100 = cls.create_product("Product 100", cls.categ_basic, 100.0)
        # The 10% tax of TestPoSCommon is included in the price.
        cls.product_taxed_10007 = cls.create_product(
            "Taxed 100.07",
            cls.categ_basic,
            100.07,
            tax_ids=cls.taxes["tax10"].ids,
        )
        cls.product_taxed_10003 = cls.create_product(
            "Taxed 100.03",
            cls.categ_basic,
            100.03,
            tax_ids=cls.taxes["tax10"].ids,
        )

    def setUp(self):
        super().setUp()
        self.config = self.basic_config

    def _set_cash_rounding(self, only_round_cash_method=False):
        """Turn on Cash Rounding 0.05 HALF-UP on the Point of Sale.

        :param bool only_round_cash_method: value of "Only on cash methods"
        """
        self.config.write(
            {
                "cash_rounding": True,
                "rounding_method": self.cash_rounding.id,
                "only_round_cash_method": only_round_cash_method,
            }
        )

    def _sync_order(
        self,
        product,
        payments,
        write_off,
        draft=False,
        customer=False,
        is_invoiced=False,
        quantity=1,
    ):
        """Sync one order from the POS UI, with a write-off.

        :param product: ordered product
        :type product: product.product
        :param list payments: pairs of payment method and amount
        :param float write_off: write-off sent by the POS
        :param bool draft: sync the order as a draft
        :param customer: customer of the order
        :type customer: res.partner
        :param bool is_invoiced: whether the order is to invoice
        :param float quantity: ordered quantity
        :return: the synced order
        :rtype: pos.order
        """
        order_data = self.create_ui_order_data(
            [(product, quantity)],
            customer=customer,
            is_invoiced=is_invoiced,
            payments=payments,
        )
        order_data["data"]["write_off_amount"] = write_off
        result = self.env["pos.order"].create_from_ui([order_data], draft=draft)
        return self.env["pos.order"].browse(result[0]["id"])

    def _close_session(self):
        """Close the current session and check that it closed without the
        balancing wizard.
        """
        session = self.pos_session
        cash_payments = session.order_ids.payment_ids.filtered(
            lambda p: p.payment_method_id.is_cash_count
        )
        session.post_closing_cash_details(sum(cash_payments.mapped("amount")))
        result = session.close_session_from_ui()
        self.assertTrue(result["successful"])
        self.assertEqual(session.state, "closed")

    def _account_balance(self, accounts):
        """Return the balance of the posted journal items of the accounts.

        :param accounts: accounts to sum
        :type accounts: account.account
        :return: debit minus credit
        :rtype: float
        """
        lines = self.env["account.move.line"].search(
            [("account_id", "in", accounts.ids), ("parent_state", "=", "posted")]
        )
        return self.company_currency.round(sum(lines.mapped("balance")))
