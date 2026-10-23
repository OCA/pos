from odoo.exceptions import ValidationError
from odoo.tests import tagged

from .common import TestPosPaymentMethodFeeCommon


@tagged("post_install", "-at_install")
class TestFeeRuleDefaults(TestPosPaymentMethodFeeCommon):
    """Field defaults on `pos.payment.method.fee`."""

    def test_fee_ids_relation(self):
        fee_rule = self._create_fee_rule()
        self.assertIn(fee_rule, self.payment_method.fee_ids)


@tagged("post_install", "-at_install")
class TestFeeRuleConstraints(TestPosPaymentMethodFeeCommon):
    """`_check_amount` validation: every branch and boundary."""

    def test_percentage_above_100_raises(self):
        with self.assertRaisesRegex(ValidationError, "between 0 and 100"):
            self._create_fee_rule(fee_type="percentage", amount=150.0)

    def test_percentage_below_0_raises(self):
        with self.assertRaisesRegex(ValidationError, "between 0 and 100"):
            self._create_fee_rule(fee_type="percentage", amount=-1.0)

    def test_percentage_lower_boundary_is_valid(self):
        fee_rule = self._create_fee_rule(fee_type="percentage", amount=0.0)
        self.assertEqual(fee_rule.amount, 0.0)

    def test_percentage_upper_boundary_is_valid(self):
        fee_rule = self._create_fee_rule(fee_type="percentage", amount=100.0)
        self.assertEqual(fee_rule.amount, 100.0)

    def test_fixed_negative_raises(self):
        with self.assertRaisesRegex(ValidationError, "positive amount"):
            self._create_fee_rule(fee_type="fixed", amount=-1.0)

    def test_fixed_zero_is_valid(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=0.0)
        self.assertEqual(fee_rule.amount, 0.0)

    def test_fixed_positive_is_valid(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=3.5)
        self.assertEqual(fee_rule.amount, 3.5)

    def test_constraint_is_revalidated_on_write(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=1.0)
        with self.assertRaises(ValidationError):
            fee_rule.write({"amount": -5.0})

    def test_changing_fee_type_revalidates_amount(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=150.0)
        with self.assertRaises(ValidationError):
            fee_rule.write({"fee_type": "percentage"})


@tagged("post_install", "-at_install")
class TestComputeFeeAmount(TestPosPaymentMethodFeeCommon):
    """`_compute_fee_amount`: percentage, fixed, refund sign and unknown
    fee type fallback."""

    def test_percentage_fee_calculation(self):
        fee_rule = self._create_fee_rule(fee_type="percentage", amount=2.0)
        self.assertAlmostEqual(fee_rule._compute_fee_amount(150.0), 3.0, places=2)

    def test_fixed_fee_calculation(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=0.5)
        self.assertAlmostEqual(fee_rule._compute_fee_amount(150.0), 0.5, places=2)

    def test_fixed_fee_sign_on_refund(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=0.5)
        self.assertAlmostEqual(fee_rule._compute_fee_amount(-50.0), -0.5, places=2)

    def test_percentage_fee_sign_on_refund(self):
        fee_rule = self._create_fee_rule(fee_type="percentage", amount=2.0)
        self.assertAlmostEqual(fee_rule._compute_fee_amount(-50.0), -1.0, places=2)

    def test_fixed_fee_zero_base_amount_keeps_positive_sign(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=0.5)
        self.assertAlmostEqual(fee_rule._compute_fee_amount(0.0), 0.5, places=2)

    def test_unknown_fee_type_returns_zero(self):
        # `fee_type` is a Selection, but `.new()` skips selection validation
        # so the fallback branch can be exercised directly.
        fee_rule = self._new_fee_rule(fee_type="unknown")
        self.assertEqual(fee_rule._compute_fee_amount(100.0), 0.0)
