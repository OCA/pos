from odoo.tests import tagged

from odoo.addons.point_of_sale.models.pos_session import PosSession

from .common import TestPosPaymentFeeCommon


@tagged("post_install", "-at_install")
class TestPosSessionFee(TestPosPaymentFeeCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)
        cls.bank_pm3 = cls.bank_pm1.copy({"name": "Bank 3"})
        cls.basic_config.payment_method_ids |= cls.bank_pm3

    def setUp(self):
        super().setUp()
        self.open_new_session()

    def _assert_balanced(self, move):
        self.assertEqual(move.state, "posted")
        self.assertAlmostEqual(sum(move.line_ids.mapped("balance")), 0.0)

    def test_grouped_session_close(self):
        self._create_rule(amount=1.0)
        self._create_rule(name="Fixed", fee_type="fixed", amount=0.25)
        self._sync_order([(self.bank_pm1, 100.0)])
        self._sync_order([(self.bank_pm1, 200.0)], quantity=2)
        lines = self.pos_session.fee_line_ids
        self.assertEqual(len(lines), 4)
        self.assertEqual(set(lines.mapped("state")), {"pending"})
        self._close_session()
        self.assertEqual(self.pos_session.state, "closed")
        move = self._fee_moves()
        self.assertEqual(len(move), 1, "One journal entry per session and journal")
        self._assert_balanced(move)
        self.assertEqual(move.date, self.pos_session.move_id.date)
        self.assertEqual(move.journal_id, self.misc_journal)
        self.assertRecordValues(
            move.line_ids.sorted("id"),
            [
                {"account_id": self.fee_account.id, "debit": 3.5, "credit": 0.0},
                {"account_id": self.outstanding_bank.id, "debit": 0.0, "credit": 3.5},
            ],
        )
        self.assertEqual(set(lines.mapped("state")), {"posted"})
        self.assertEqual(lines.account_move_line_id, move.line_ids.filtered("debit"))
        self.assertEqual(set(lines.mapped("posting_date")), {move.date})

    def test_detailed_session_close(self):
        self.bank_pm1.fee_grouping_policy = "detailed"
        self._create_rule(amount=1.0)
        self._sync_order([(self.bank_pm1, 100.0)])
        self._sync_order([(self.bank_pm1, 200.0)], quantity=2)
        self._close_session()
        move = self._fee_moves()
        self.assertEqual(len(move), 1, "Detailed does not mean one entry per fee")
        self._assert_balanced(move)
        expense = move.line_ids.filtered("debit")
        self.assertEqual(sorted(expense.mapped("debit")), [1.0, 2.0])
        self.assertEqual(len(move.line_ids.filtered("credit")), 1)
        lines = self.pos_session.fee_line_ids
        self.assertEqual(lines.account_move_line_id, expense)
        for line in lines:
            self.assertEqual(line.account_move_line_id.debit, line.fee_amount)
            self.assertIn(line.payment_id.display_name, line.account_move_line_id.name)

    def test_grouping_by_journal_and_account(self):
        bank_pm3 = self.bank_pm3
        bank_pm3.fee_grouping_policy = "detailed"
        self._create_rule(amount=1.0)
        self._create_rule(
            name="Other account", amount=1.0, account_id=self.fee_account_2.id
        )
        self._create_rule(
            name="Other journal", amount=1.0, journal_id=self.fee_journal_2.id
        )
        self._create_rule(method=bank_pm3, amount=2.0)
        self._sync_order([(self.bank_pm1, 50.0), (bank_pm3, 50.0)])
        self._close_session()
        moves = self._fee_moves()
        self.assertEqual(moves.journal_id, self.misc_journal | self.fee_journal_2)
        misc_move = moves.filtered(lambda m: m.journal_id == self.misc_journal)
        expense = misc_move.line_ids.filtered("debit")
        # grouped rules of bank_pm1 by account + one detailed line of bank_pm3
        self.assertEqual(
            sorted((line.account_id.code, line.debit) for line in expense),
            sorted([("FEE001", 0.5), ("FEE002", 0.5), ("FEE001", 1.0)]),
        )
        for move in moves:
            self._assert_balanced(move)

    def test_posted_with_snapshot_after_configuration_changes(self):
        rule = self._create_rule(amount=1.0)
        self._sync_order([(self.bank_pm1, 100.0)])
        new_outstanding = self.outstanding_bank.copy({"code": "OUTNEW"})
        rule.write(
            {
                "amount": 5.0,
                "account_id": self.fee_account_2.id,
                "journal_id": self.fee_journal_2.id,
                "posting_policy": "immediate",
                "counterpart_account_id": new_outstanding.id,
            }
        )
        rule.active = False
        self.bank_pm1.fee_grouping_policy = "detailed"
        self._close_session()
        move = self._fee_moves()
        self.assertEqual(move.journal_id, self.misc_journal)
        self.assertRecordValues(
            move.line_ids.sorted("id"),
            [
                {"account_id": self.fee_account.id, "debit": 1.0, "credit": 0.0},
                {"account_id": self.outstanding_bank.id, "debit": 0.0, "credit": 1.0},
            ],
        )

    def test_immediate_fees_posted_per_order(self):
        self._create_rule(amount=1.0, posting_policy="immediate")
        self._create_rule(name="At close", amount=2.0)
        order = self._sync_order([(self.bank_pm1, 100.0)])
        immediate = order.payment_ids.fee_line_ids.filtered(
            lambda line: line.posting_policy == "immediate"
        )
        self.assertEqual(immediate.state, "posted")
        self.assertEqual(
            immediate.posting_date, self._today_for(immediate, order.date_order)
        )
        self._assert_balanced(immediate.move_id)
        at_close = order.payment_ids.fee_line_ids - immediate
        self.assertEqual(at_close.state, "pending")
        self._close_session()
        self.assertEqual(at_close.state, "posted")
        self.assertNotEqual(at_close.move_id, immediate.move_id)
        self.assertEqual(len(self._fee_moves()), 2)

    def test_close_from_ui_as_pos_user(self):
        self._create_rule(amount=1.0)
        self._sync_order([(self.bank_pm1, 100.0)], user=self.pos_user)
        self._close_session(user=self.pos_user)
        self.assertEqual(self.pos_session.fee_line_ids.state, "posted")

    def test_close_from_backend(self):
        self._create_rule(amount=1.0)
        self._sync_order([(self.bank_pm1, 100.0)])
        self.pos_session.action_pos_session_closing_control()
        self.assertEqual(self.pos_session.state, "closed")
        self.assertEqual(self.pos_session.fee_line_ids.state, "posted")

    def test_fees_not_posted_when_session_not_closed(self):
        """When closing ends up in the balancing wizard the session stays
        open, so its fees must stay pending."""
        self._create_rule(amount=1.0)
        self._sync_order([(self.bank_pm1, 100.0)])
        wizard = {
            "type": "ir.actions.act_window",
            "res_model": "pos.close.session.wizard",
        }
        self.patch(PosSession, "_validate_session", lambda *args, **kwargs: wizard)
        result = self.pos_session.action_pos_session_validate()
        self.assertEqual(result, wizard)
        self.assertEqual(self.pos_session.fee_line_ids.state, "pending")

    def test_session_without_fees(self):
        self._sync_order([(self.bank_pm1, 100.0)])
        self._close_session()
        self.assertFalse(self.pos_session.fee_line_ids)
        self.assertEqual(self.pos_session.fee_line_count, 0)

    def test_session_fee_lines_action(self):
        self._create_rule(amount=1.0)
        self._sync_order([(self.bank_pm1, 100.0)])
        self.assertEqual(self.pos_session.fee_line_count, 1)
        action = self.pos_session.action_view_fee_lines()
        self.assertEqual(action["res_model"], "pos.payment.fee.line")
        self.assertEqual(
            self.env[action["res_model"]].search(action["domain"]),
            self.pos_session.fee_line_ids,
        )
