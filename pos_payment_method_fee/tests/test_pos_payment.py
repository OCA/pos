from odoo.tests import tagged

from .common import TestPosPaymentMethodFeeCommon


@tagged("post_install", "-at_install")
class TestCreatePaymentMethodFees(TestPosPaymentMethodFeeCommon):
    """`pos.payment._create_payment_method_fees`: fee line generation
    triggered on payment creation, and every guard condition."""

    def test_payment_method_without_fees_no_lines(self):
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        self.assertFalse(payment.fee_line_ids)

    def test_inactive_fee_rule_not_applied(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=1.0)
        fee_rule.active = False
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        self.assertFalse(payment.fee_line_ids)

    def test_zero_fee_does_not_create_line(self):
        self._create_fee_rule(fee_type="fixed", amount=0.0)
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        self.assertFalse(payment.fee_line_ids)

    def test_multiple_fees_creates_one_line_per_rule(self):
        self._create_fee_rule(
            name="Fee A - percentage", fee_type="percentage", amount=1.5
        )
        self._create_fee_rule(name="Fee B - fixed", fee_type="fixed", amount=0.30)
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        self.assertEqual(len(payment.fee_line_ids), 2)

    def test_multiple_payment_methods_independent_fees(self):
        self._create_fee_rule(payment_method_id=self.payment_method.id)
        order = self._create_order(100.0)
        payment_a = self._create_payment(
            order, 100.0, payment_method=self.payment_method
        )
        payment_b = self._create_payment(
            order, 50.0, payment_method=self.payment_method_b
        )
        self.assertTrue(payment_a.fee_line_ids)
        self.assertFalse(payment_b.fee_line_ids)

    def test_order_amounts_not_altered_by_fees(self):
        """Fees must never alter the receipt, paid amount, or taxes: they act
        exclusively as an internal financial cost."""
        self._create_fee_rule(fee_type="percentage", amount=5.0)
        order = self._create_order(200.0)
        payment = self._create_payment(order, 200.0)
        self.assertEqual(order.amount_total, 200.0)
        self.assertEqual(order.amount_tax, 0.0)
        self.assertEqual(payment.amount, 200.0)
        self.assertTrue(payment.fee_line_ids)

    def test_fee_line_fields_are_populated_correctly(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=1.0)
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        fee_line = payment.fee_line_ids
        self.assertEqual(fee_line.fee_rule_id, fee_rule)
        self.assertEqual(fee_line.amount_base, 100.0)
        self.assertAlmostEqual(fee_line.fee_amount, 1.0, places=2)
        self.assertEqual(fee_line.session_id, self.pos_session)
        self.assertEqual(fee_line.state, "draft")

    def test_immediate_policy_posts_fee_line_right_away(self):
        self._create_fee_rule(posting_policy="immediate", fee_type="fixed", amount=1.0)
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        self.assertEqual(payment.fee_line_ids.state, "posted")

    def test_session_close_policy_leaves_fee_line_draft(self):
        self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        self.assertEqual(payment.fee_line_ids.state, "draft")


@tagged("post_install", "-at_install")
class TestTotalFeeAmountCompute(TestPosPaymentMethodFeeCommon):
    """`pos.payment._compute_total_fee_amount`."""

    def test_total_fee_amount_sums_all_fee_lines(self):
        self._create_fee_rule(
            name="Fee A - percentage", fee_type="percentage", amount=1.5
        )
        self._create_fee_rule(name="Fee B - fixed", fee_type="fixed", amount=0.30)
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        self.assertAlmostEqual(payment.total_fee_amount, 1.80, places=2)

    def test_total_fee_amount_zero_without_fee_lines(self):
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        self.assertEqual(payment.total_fee_amount, 0.0)

    def test_total_fee_amount_recomputes_when_fee_line_added(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=1.0)
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        self.assertAlmostEqual(payment.total_fee_amount, 1.0, places=2)

        self._create_draft_fee_line(payment, fee_rule, 2.0)
        self.assertAlmostEqual(payment.total_fee_amount, 3.0, places=2)
