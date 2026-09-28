from unittest.mock import patch

from odoo.tests import tagged

from .common import TestPosPaymentMethodFeeCommon


@tagged("post_install", "-at_install")
class TestProcessPosPaymentMethodFees(TestPosPaymentMethodFeeCommon):
    """`pos.session._process_pos_payment_method_fees`: scoping and
    filtering of draft session_close fee lines."""

    def test_processes_only_draft_session_close_lines(self):
        fee_rule_session_close = self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        fee_rule_immediate = self._create_fee_rule(
            name="Immediate Fee",
            posting_policy="immediate",
            fee_type="fixed",
            amount=1.0,
        )
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)

        draft_line = payment.fee_line_ids.filtered(
            lambda l: l.fee_rule_id == fee_rule_session_close
        )
        immediate_line = payment.fee_line_ids.filtered(
            lambda l: l.fee_rule_id == fee_rule_immediate
        )
        self.assertEqual(draft_line.state, "draft")
        self.assertEqual(immediate_line.state, "posted")

        self.pos_session._process_pos_payment_method_fees()

        self.assertEqual(draft_line.state, "posted")
        self.assertTrue(draft_line.account_move_line_id)
        # Already-posted immediate line must be left untouched.
        self.assertTrue(immediate_line.account_move_line_id)

    def test_does_not_process_lines_from_another_session(self):
        self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        other_config = self.env["pos.config"].create({"name": "Other Shop"})
        other_session = self.env["pos.session"].create({"config_id": other_config.id})

        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        fee_line = payment.fee_line_ids
        fee_line.session_id = other_session.id

        self.pos_session._process_pos_payment_method_fees()

        self.assertEqual(
            fee_line.state,
            "draft",
            "Fee lines belonging to another session must not be processed",
        )

    def test_does_not_reprocess_already_posted_lines(self):
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        fee_line = payment.fee_line_ids
        self.pos_session._process_pos_payment_method_fees()
        move_line = fee_line.account_move_line_id
        self.assertTrue(move_line)

        # A second call must be a no-op: no new move for the same line.
        self.pos_session._process_pos_payment_method_fees()
        self.assertEqual(fee_line.account_move_line_id, move_line)

    def test_noop_when_no_draft_fee_lines(self):
        # No fee rules configured: must not raise despite no draft lines.
        self.pos_session._process_pos_payment_method_fees()

    def test_ensure_one_is_enforced(self):
        other_config = self.env["pos.config"].create({"name": "Other Shop 2"})
        other_session = self.env["pos.session"].create({"config_id": other_config.id})
        with self.assertRaises(ValueError):
            (self.pos_session | other_session)._process_pos_payment_method_fees()


@tagged("post_install", "-at_install")
class TestActionPosSessionClosingControl(TestPosPaymentMethodFeeCommon):
    """`pos.session.action_pos_session_closing_control`: delegation to the
    fee posting engine after the core POS closing logic runs."""

    @patch(
        "odoo.addons.point_of_sale.models.pos_session.PosSession"
        ".action_pos_session_closing_control"
    )
    def test_closing_control_delegates_to_fee_processing(self, super_mock):
        super_mock.return_value = "super result"
        self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        order = self._create_order(100.0)
        payment = self._create_payment(order, 100.0)
        fee_line = payment.fee_line_ids
        self.assertEqual(fee_line.state, "draft")

        result = self.pos_session.action_pos_session_closing_control()

        super_mock.assert_called_once()
        self.assertEqual(result, "super result")
        self.assertEqual(fee_line.state, "posted")
        self.assertTrue(fee_line.account_move_line_id)

    @patch(
        "odoo.addons.point_of_sale.models.pos_session.PosSession"
        ".action_pos_session_closing_control"
    )
    def test_closing_control_processes_every_session_in_the_recordset(self, super_mock):
        super_mock.return_value = True
        self._create_fee_rule(
            posting_policy="session_close", fee_type="fixed", amount=1.0
        )
        other_config = self.env["pos.config"].create({"name": "Other Shop 3"})
        other_session = self.env["pos.session"].create({"config_id": other_config.id})

        order1 = self._create_order(100.0, session=self.pos_session)
        payment1 = self._create_payment(order1, 100.0)
        order2 = self._create_order(50.0, session=self.pos_session)
        payment2 = self._create_payment(order2, 50.0)
        # Attach the second payment's fee line to the other session to
        # simulate an independent draft fee pending on it.
        payment2.fee_line_ids.session_id = other_session.id

        sessions = self.pos_session | other_session
        sessions.action_pos_session_closing_control()

        self.assertEqual(payment1.fee_line_ids.state, "posted")
        self.assertEqual(payment2.fee_line_ids.state, "posted")
