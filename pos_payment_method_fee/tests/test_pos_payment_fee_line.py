from odoo import fields
from odoo.exceptions import UserError
from odoo.tests import tagged

from .common import TestPosPaymentMethodFeeCommon


@tagged("post_install", "-at_install")
class TestPrepareAccountMoveVals(TestPosPaymentMethodFeeCommon):
    """Unit tests for `pos.payment.fee.line._prepare_account_move_vals`."""

    def setUp(self):
        super().setUp()
        self.fee_line_model = self.env["pos.payment.fee.line"]

    def test_positive_amount_debits_fee_account(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=1.0)
        vals = self.fee_line_model._prepare_account_move_vals(
            5.0, fee_rule, "Test Label"
        )
        self.assertEqual(vals["journal_id"], self.misc_journal.id)
        self.assertEqual(vals["company_id"], fee_rule.company_id.id)
        self.assertEqual(vals["ref"], "Test Label")
        self.assertEqual(vals["date"], fields.Date.today())

        debit_line, credit_line = vals["line_ids"][0][2], vals["line_ids"][1][2]
        self.assertEqual(debit_line["account_id"], self.fee_expense_account.id)
        self.assertEqual(debit_line["debit"], 5.0)
        self.assertEqual(debit_line["credit"], 0.0)
        self.assertEqual(credit_line["account_id"], self.counterpart_account.id)
        self.assertEqual(credit_line["debit"], 0.0)
        self.assertEqual(credit_line["credit"], 5.0)

    def test_negative_amount_flips_debit_credit(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=1.0)
        vals = self.fee_line_model._prepare_account_move_vals(
            -5.0, fee_rule, "Refund Label"
        )
        debit_line, credit_line = vals["line_ids"][0][2], vals["line_ids"][1][2]

        # Amount is stored positive, but accounts are swapped.
        self.assertEqual(debit_line["account_id"], self.counterpart_account.id)
        self.assertEqual(debit_line["debit"], 5.0)
        self.assertEqual(credit_line["account_id"], self.fee_expense_account.id)
        self.assertEqual(credit_line["credit"], 5.0)

    def test_company_id_falls_back_to_env_company(self):
        fee_rule = self._new_fee_rule(company_id=False)
        vals = self.fee_line_model._prepare_account_move_vals(5.0, fee_rule, "Label")
        self.assertEqual(vals["company_id"], self.env.company.id)

    def test_missing_journal_raises_user_error(self):
        fee_rule = self._new_fee_rule(journal_id=False)
        with self.assertRaisesRegex(UserError, "Posting Journal"):
            self.fee_line_model._prepare_account_move_vals(5.0, fee_rule, "Label")

    def test_missing_fee_account_raises_user_error(self):
        fee_rule = self._new_fee_rule(account_id=False)
        with self.assertRaisesRegex(UserError, "Fee Account"):
            self.fee_line_model._prepare_account_move_vals(5.0, fee_rule, "Label")

    def test_missing_counterpart_account_raises_user_error(self):
        fee_rule = self._new_fee_rule(counterpart_account_id=False)
        with self.assertRaisesRegex(UserError, "Counterpart Account"):
            self.fee_line_model._prepare_account_move_vals(5.0, fee_rule, "Label")

    def test_missing_both_fee_and_counterpart_accounts_raises_user_error(self):
        fee_rule = self._new_fee_rule(account_id=False, counterpart_account_id=False)
        with self.assertRaisesRegex(UserError, "Fee Account"):
            self.fee_line_model._prepare_account_move_vals(5.0, fee_rule, "Label")


@tagged("post_install", "-at_install")
class TestPostFeeAmount(TestPosPaymentMethodFeeCommon):
    """`pos.payment.fee.line._post_fee_amount`."""

    def test_creates_posted_move(self):
        fee_rule = self._create_fee_rule(fee_type="fixed", amount=1.0)
        move = self.env["pos.payment.fee.line"]._post_fee_amount(
            3.0, fee_rule, "Direct Label"
        )
        self.assertEqual(move.state, "posted")
        self.assertEqual(move.ref, "Direct Label")
        fee_move_line = move.line_ids.filtered(
            lambda l: l.account_id == self.fee_expense_account
        )
        self.assertAlmostEqual(fee_move_line.debit, 3.0, places=2)

    def test_propagates_configuration_errors(self):
        fee_rule = self._new_fee_rule(journal_id=False)
        with self.assertRaises(UserError):
            self.env["pos.payment.fee.line"]._post_fee_amount(3.0, fee_rule, "Label")


@tagged("post_install", "-at_install")
class TestPostImmediate(TestPosPaymentMethodFeeCommon):
    """`pos.payment.fee.line._post_immediate`."""

    def test_immediate_posting_creates_move(self):
        self._create_fee_rule(posting_policy="immediate", fee_type="fixed", amount=1.0)
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        fee_line = payment.fee_line_ids
        self.assertEqual(len(fee_line), 1)
        self.assertEqual(fee_line.state, "posted")
        self.assertTrue(fee_line.account_move_line_id)

        move = fee_line.account_move_line_id.move_id
        self.assertEqual(move.state, "posted")
        self.assertAlmostEqual(sum(move.line_ids.mapped("debit")), 1.0, places=2)
        self.assertAlmostEqual(sum(move.line_ids.mapped("credit")), 1.0, places=2)

    def test_sets_matching_move_line(self):
        fee_rule = self._create_fee_rule(
            posting_policy="immediate", fee_type="fixed", amount=1.0
        )
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        fee_line = self._create_draft_fee_line(payment, fee_rule, 1.0)

        fee_line._post_immediate()

        self.assertEqual(fee_line.state, "posted")
        self.assertTrue(fee_line.account_move_line_id)
        self.assertEqual(
            fee_line.account_move_line_id.account_id, self.fee_expense_account
        )

    def test_zero_amount_skips_move_creation(self):
        fee_rule = self._create_fee_rule(
            posting_policy="immediate", fee_type="fixed", amount=1.0
        )
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        fee_line = self._create_draft_fee_line(payment, fee_rule, 0.0)

        fee_line._post_immediate()

        self.assertEqual(fee_line.state, "posted")
        self.assertFalse(fee_line.account_move_line_id)

    def test_refund_flips_debit_credit(self):
        self._create_fee_rule(
            posting_policy="immediate", fee_type="percentage", amount=2.0
        )
        order = self._create_order(-100.0)
        payment = self._create_payment(order, -100.0)
        fee_line = payment.fee_line_ids
        self.assertAlmostEqual(fee_line.fee_amount, -2.0, places=2)

        move = fee_line.account_move_line_id.move_id
        fee_account_line = move.line_ids.filtered(
            lambda l: l.account_id == self.fee_expense_account
        )
        # On a refund, the fee is reversed: the fee account is credited
        # instead of debited.
        self.assertAlmostEqual(fee_account_line.credit, 2.0, places=2)
        self.assertAlmostEqual(fee_account_line.debit, 0.0, places=2)


@tagged("post_install", "-at_install")
class TestActionPostSessionCloseFees(TestPosPaymentMethodFeeCommon):
    """`action_post_session_close_fees`: dispatch to grouped/detailed."""

    def test_mixed_policies_routed_to_correct_posting_method(self):
        """A grouped payment method and a detailed one, each with a
        session_close fee, must be routed to their own posting method."""
        fee_rule_grouped = self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        fee_rule_detailed = self._create_fee_rule(
            name="Detailed Fee",
            payment_method_id=self.payment_method_b.id,
            posting_policy="session_close",
            fee_type="fixed",
            amount=1.0,
        )
        self.payment_method.fee_grouping_policy = "grouped"
        self.payment_method_b.fee_grouping_policy = "detailed"

        order1 = self._create_order(100.0)
        order2 = self._create_order(50.0)
        payment1 = self._create_payment(order1, 100.0)
        payment2 = self._create_payment(
            order2, 50.0, payment_method=self.payment_method
        )
        payment3 = self._create_payment(
            order1, 100.0, payment_method=self.payment_method_b
        )
        payment4 = self._create_payment(
            order2, 50.0, payment_method=self.payment_method_b
        )

        fee_lines = (
            payment1.fee_line_ids
            | payment2.fee_line_ids
            | payment3.fee_line_ids
            | payment4.fee_line_ids
        )
        self.assertEqual(len(fee_lines), 4)

        fee_lines.action_post_session_close_fees()
        self.assertTrue(all(line.state == "posted" for line in fee_lines))

        grouped_moves = fee_lines.filtered(
            lambda l: l.fee_rule_id == fee_rule_grouped
        ).mapped("account_move_line_id.move_id")
        detailed_moves = fee_lines.filtered(
            lambda l: l.fee_rule_id == fee_rule_detailed
        ).mapped("account_move_line_id.move_id")
        self.assertEqual(
            len(grouped_moves), 1, "Grouped payment method must yield a single move"
        )
        self.assertEqual(
            len(detailed_moves),
            2,
            "Detailed payment method must yield one move per line",
        )

    def test_all_grouped_lines_routed_to_grouped_posting(self):
        fee_rule = self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        self.payment_method.fee_grouping_policy = "grouped"
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        line_a = self._create_draft_fee_line(payment, fee_rule, 1.0)
        line_b = self._create_draft_fee_line(payment, fee_rule, 1.0)

        (line_a | line_b).action_post_session_close_fees()

        moves = (line_a | line_b).mapped("account_move_line_id.move_id")
        self.assertEqual(len(moves), 1)

    def test_all_detailed_lines_routed_to_detailed_posting(self):
        fee_rule = self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        self.payment_method.fee_grouping_policy = "detailed"
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        line_a = self._create_draft_fee_line(payment, fee_rule, 1.0)
        line_b = self._create_draft_fee_line(payment, fee_rule, 1.0)

        (line_a | line_b).action_post_session_close_fees()

        moves = (line_a | line_b).mapped("account_move_line_id.move_id")
        self.assertEqual(len(moves), 2)


@tagged("post_install", "-at_install")
class TestPostGroupedFees(TestPosPaymentMethodFeeCommon):
    """`pos.payment.fee.line._post_grouped_fees`."""

    def test_groups_same_fee_rule_into_a_single_move(self):
        self.payment_method.fee_grouping_policy = "grouped"

        order1 = self._create_order(100.0)
        order2 = self._create_order(50.0)
        payment1 = self._create_payment(order1, 100.0)
        payment2 = self._create_payment(order2, 50.0)

        self.pos_session._process_pos_payment_method_fees()

        fee_lines = payment1.fee_line_ids | payment2.fee_line_ids
        self.assertTrue(all(line.state == "posted" for line in fee_lines))

        moves = fee_lines.mapped("account_move_line_id.move_id")
        self.assertEqual(
            len(moves), 1, "Grouped policy must create a single journal entry"
        )
        self.assertAlmostEqual(sum(moves.line_ids.mapped("debit")), 2.0, places=2)

    def test_different_fee_rules_are_grouped_independently(self):
        """Two different fee rules on the same payment method must generate
        two independent grouped journal entries."""
        self._create_fee_rule(
            name="Fee Percentage",
            posting_policy="session_close",
            fee_type="percentage",
            amount=1.0,
        )
        self._create_fee_rule(
            name="Fee Fixed",
            posting_policy="session_close",
            fee_type="fixed",
            amount=0.5,
        )
        self.payment_method.fee_grouping_policy = "grouped"

        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        self.assertEqual(len(payment.fee_line_ids), 2)

        self.pos_session._process_pos_payment_method_fees()

        moves = payment.fee_line_ids.mapped("account_move_line_id.move_id")
        self.assertEqual(len(moves), 2)

    def test_zero_total_skips_move_creation(self):
        fee_rule = self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        line_a = self._create_draft_fee_line(payment, fee_rule, 2.0)
        line_b = self._create_draft_fee_line(payment, fee_rule, -2.0)

        (line_a | line_b)._post_grouped_fees()

        self.assertTrue(all(line.state == "posted" for line in (line_a, line_b)))
        self.assertFalse(line_a.account_move_line_id)
        self.assertFalse(line_b.account_move_line_id)

    def test_sets_move_line_and_state_on_all_grouped_lines(self):
        fee_rule = self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        line_a = self._create_draft_fee_line(payment, fee_rule, 1.0)
        line_b = self._create_draft_fee_line(payment, fee_rule, 1.0)

        (line_a | line_b)._post_grouped_fees()

        self.assertTrue(line_a.account_move_line_id)
        self.assertEqual(line_a.account_move_line_id, line_b.account_move_line_id)


@tagged("post_install", "-at_install")
class TestPostDetailedFees(TestPosPaymentMethodFeeCommon):
    """`pos.payment.fee.line._post_detailed_fees`."""

    def test_posts_one_move_per_line(self):
        self.payment_method.fee_grouping_policy = "detailed"

        order1 = self._create_order(100.0)
        order2 = self._create_order(50.0)
        payment1 = self._create_payment(order1, 100.0)
        payment2 = self._create_payment(order2, 50.0)

        self.pos_session._process_pos_payment_method_fees()

        fee_lines = payment1.fee_line_ids | payment2.fee_line_ids
        self.assertTrue(all(line.state == "posted" for line in fee_lines))

        moves = fee_lines.mapped("account_move_line_id.move_id")
        self.assertEqual(
            len(moves), 2, "Detailed policy must create one entry per fee line"
        )

    def test_direct_call_posts_each_line_independently(self):
        fee_rule = self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        line_a = self._create_draft_fee_line(payment, fee_rule, 1.0)
        line_b = self._create_draft_fee_line(payment, fee_rule, 2.0)

        (line_a | line_b)._post_detailed_fees()

        self.assertNotEqual(
            line_a.account_move_line_id.move_id, line_b.account_move_line_id.move_id
        )
