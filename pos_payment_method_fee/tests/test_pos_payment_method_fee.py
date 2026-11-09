from odoo.exceptions import UserError, ValidationError
from odoo.tests import tagged

from .common import TestPosPaymentFeeCommon


@tagged("post_install", "-at_install")
class TestPosPaymentMethodFee(TestPosPaymentFeeCommon):
    def test_defaults(self):
        rule = self._create_rule()
        self.assertEqual(rule.company_id, self.company)
        self.assertEqual(rule.currency_id, self.company.currency_id)
        self.assertFalse(rule.apply_on_refunds)
        self.assertTrue(rule.active)

    def test_percentage_bounds(self):
        self._create_rule(amount=0.0)
        self._create_rule(name="Full", amount=100.0)
        for amount in (-0.1, 100.1):
            with self.assertRaisesRegex(ValidationError, "between 0 and 100"):
                self._create_rule(amount=amount)

    def test_fixed_cannot_be_negative(self):
        self._create_rule(fee_type="fixed", amount=0.0)
        with self.assertRaisesRegex(ValidationError, "cannot be negative"):
            self._create_rule(fee_type="fixed", amount=-1.0)

    def test_rule_only_on_bank_methods(self):
        for method in (self.cash_pm1, self.pay_later_pm):
            with self.assertRaisesRegex(ValidationError, "bank journal"):
                self._create_rule(method=method)

    def test_rule_requires_method_company(self):
        method = self.bank_pm1.sudo().copy({"name": "No company", "company_id": False})
        with self.assertRaisesRegex(ValidationError, "must belong to a company"):
            self._create_rule(method=method)

    def test_fee_account_not_deprecated(self):
        self.fee_account.deprecated = True
        with self.assertRaisesRegex(ValidationError, "deprecated"):
            self._create_rule()

    def test_counterpart_account_must_be_reconcilable_and_active(self):
        not_reconcilable = self.fee_account_2
        with self.assertRaisesRegex(ValidationError, "allow reconciliation"):
            self._create_rule(counterpart_account_id=not_reconcilable.id)
        deprecated = self.outstanding_bank.copy({"code": "OUTDEP"})
        deprecated.deprecated = True
        with self.assertRaisesRegex(ValidationError, "allow reconciliation"):
            self._create_rule(counterpart_account_id=deprecated.id)
        rule = self._create_rule(counterpart_account_id=self.outstanding_bank.id)
        self.assertEqual(rule.counterpart_account_id, self.outstanding_bank)

    def test_posting_journal_type(self):
        self._create_rule(journal_id=self.company_data["default_journal_bank"].id)
        with self.assertRaisesRegex(ValidationError, "bank or a miscellaneous"):
            self._create_rule(journal_id=self.company_data["default_journal_sale"].id)

    def test_accounts_must_belong_to_rule_company(self):
        other_account = self.company_data_2["default_account_expense"]
        with self.assertRaises(UserError):
            self._create_rule(account_id=other_account.id)

    def test_effective_counterpart_account(self):
        rule = self._create_rule()
        self.assertEqual(rule._get_counterpart_account(), self.outstanding_bank)
        custom = self.outstanding_bank.copy({"code": "OUTCUS"})
        rule.counterpart_account_id = custom
        self.assertEqual(rule._get_counterpart_account(), custom)
