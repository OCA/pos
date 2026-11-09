from odoo.exceptions import UserError, ValidationError
from odoo.tests import tagged

from .common import TestPosPaymentFeeCommon


@tagged("post_install", "-at_install")
class TestPosPaymentMethod(TestPosPaymentFeeCommon):
    def test_fees_applicable_only_on_enabled_bank_methods(self):
        self.assertTrue(self.bank_pm1._fees_applicable())
        self.bank_pm1.use_transaction_fees = False
        self.assertFalse(self.bank_pm1._fees_applicable())

    def test_cannot_enable_fees_on_cash_method(self):
        with self.assertRaisesRegex(ValidationError, "bank journal"):
            self.cash_pm1.use_transaction_fees = True

    def test_cannot_enable_fees_on_customer_account_method(self):
        with self.assertRaisesRegex(ValidationError, "bank journal"):
            self.pay_later_pm.use_transaction_fees = True

    def test_cannot_switch_fee_method_to_cash_journal(self):
        with self.assertRaisesRegex(ValidationError, "bank journal"):
            self.bank_pm1.journal_id = self.company_data["default_journal_cash"]

    def test_cannot_switch_method_with_rules_to_cash_journal(self):
        """Disabled fees keep their rules, which also lock the journal type."""
        self._create_rule()
        self.bank_pm1.use_transaction_fees = False
        with self.assertRaisesRegex(ValidationError, "bank journal"):
            self.bank_pm1.journal_id = self.company_data["default_journal_cash"]

    def test_fee_fields_writable_with_open_session(self):
        self.open_new_session()
        self.bank_pm1.write(
            {
                "use_transaction_fees": False,
                "fee_grouping_policy": "detailed",
                "fee_ids": [(0, 0, self._rule_vals())],
            }
        )
        self.assertEqual(self.bank_pm1.fee_grouping_policy, "detailed")
        self.assertEqual(len(self.bank_pm1.fee_ids), 1)
        with self.assertRaises(UserError):
            self.bank_pm1.name = "Renamed"

    def test_counterpart_account_defaults(self):
        self.assertEqual(
            self.bank_pm1._get_fee_counterpart_account(), self.outstanding_bank
        )
        self.bank_pm1.outstanding_account_id = False
        self.assertEqual(
            self.bank_pm1._get_fee_counterpart_account(),
            self.company.account_journal_payment_debit_account_id,
        )

    def _rule_vals(self):
        return {
            "name": "Card fee",
            "fee_type": "percentage",
            "amount": 1.0,
            "account_id": self.fee_account.id,
            "journal_id": self.misc_journal.id,
        }
