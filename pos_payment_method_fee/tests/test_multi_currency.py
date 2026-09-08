from odoo.tests import tagged

from .common import TestPosPaymentFeeCommon


@tagged("post_install", "-at_install")
class TestPosPaymentFeeMultiCurrency(TestPosPaymentFeeCommon):
    """The other currency config uses a rate of 0.5: 1 company unit is worth
    0.5 units of the other currency, i.e. 100 other = 200 company."""

    def setUp(self):
        super().setUp()
        self.config = self.other_currency_config
        self.bank_pm2.use_transaction_fees = True
        self.open_new_session()

    def test_percentage_fee_in_foreign_currency(self):
        self._create_rule(method=self.bank_pm2, amount=2.0)
        order_total = self._total()
        order = self._sync_order([(self.bank_pm2, order_total)])
        line = order.payment_ids.fee_line_ids
        self.assertEqual(line.currency_id, self.other_currency)
        self.assertAlmostEqual(line.fee_amount, order_total * 0.02)
        self.assertAlmostEqual(line.fee_amount_company, order_total * 0.02 * 2)
        self._close_session()
        move = self._fee_moves()
        self.assertEqual(move.state, "posted")
        self.assertRecordValues(
            move.line_ids.sorted("id"),
            [
                {
                    "account_id": self.fee_account.id,
                    "currency_id": self.other_currency.id,
                    "amount_currency": line.fee_amount,
                    "debit": line.fee_amount_company,
                    "credit": 0.0,
                },
                {
                    "account_id": self.outstanding_bank.id,
                    "currency_id": self.other_currency.id,
                    "amount_currency": -line.fee_amount,
                    "debit": 0.0,
                    "credit": line.fee_amount_company,
                },
            ],
        )

    def test_fixed_fee_in_company_currency(self):
        self._create_rule(method=self.bank_pm2, fee_type="fixed", amount=1.0)
        order = self._sync_order([(self.bank_pm2, self._total())])
        line = order.payment_ids.fee_line_ids
        self.assertEqual(line.fee_currency_id, self.company_currency)
        self.assertAlmostEqual(line.fee_amount, 0.5)
        self.assertAlmostEqual(line.fee_amount_company, 1.0)

    def test_fixed_fee_in_payment_currency(self):
        self._create_rule(
            method=self.bank_pm2,
            fee_type="fixed",
            amount=1.0,
            currency_id=self.other_currency.id,
            posting_policy="immediate",
        )
        order = self._sync_order([(self.bank_pm2, self._total())])
        line = order.payment_ids.fee_line_ids
        self.assertAlmostEqual(line.fee_amount, 1.0)
        self.assertAlmostEqual(line.fee_amount_company, 2.0)
        self.assertEqual(line.state, "posted")
        expense = line.account_move_line_id
        self.assertEqual(expense.amount_currency, 1.0)
        self.assertEqual(expense.debit, 2.0)

    def _total(self):
        return self.pricelist._get_product_price(self.product, 1)
