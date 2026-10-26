from psycopg2 import IntegrityError

from odoo import fields
from odoo.exceptions import AccessError, UserError
from odoo.tests import tagged
from odoo.tools import mute_logger

from .common import TestPosPaymentFeeCommon


@tagged("post_install", "-at_install")
class TestPosPaymentFeeLine(TestPosPaymentFeeCommon):
    def setUp(self):
        super().setUp()
        self.open_new_session()

    def _immediate_line_in_error(self):
        self._create_rule(amount=1.0, posting_policy="immediate")
        self.fee_account.deprecated = True
        order = self._sync_order([(self.bank_pm1, 100.0)], user=self.pos_user)
        return order, order.payment_ids.fee_line_ids

    def test_posting_error_does_not_block_the_sale(self):
        order, line = self._immediate_line_in_error()
        self.assertEqual(order.state, "paid")
        self.assertEqual(line.state, "error")
        self.assertIn("deprecated", line.error_message)
        self.assertFalse(line.move_id)
        self.assertFalse(
            self.env["account.move"].search([("journal_id", "=", self.misc_journal.id)])
        )
        self.assertTrue(line.posting_date, "The accounting date is kept for retries")

    def test_retry_posting(self):
        _order, line = self._immediate_line_in_error()
        posting_date = line.posting_date
        self.fee_account.deprecated = False
        line.with_user(self.pos_manager).action_retry_posting()
        self.assertEqual(line.state, "posted")
        self.assertFalse(line.error_message)
        self.assertEqual(line.move_id.date, posting_date)
        # retrying a posted line does nothing
        move = line.move_id
        line.action_retry_posting()
        self.assertEqual(line.move_id, move)
        self.assertEqual(len(self._fee_moves()), 1)

    def test_retry_posting_requires_manager(self):
        _order, line = self._immediate_line_in_error()
        with self.assertRaises(AccessError):
            line.with_user(self.pos_user).action_retry_posting()
        self.assertEqual(line.state, "error")

    def test_session_close_retries_errors(self):
        _order, line = self._immediate_line_in_error()
        self.fee_account.deprecated = False
        self._close_session()
        self.assertEqual(line.state, "posted")

    def test_failing_group_does_not_block_other_groups(self):
        self._create_rule(amount=1.0)
        self._create_rule(
            name="Other",
            amount=1.0,
            account_id=self.fee_account_2.id,
            journal_id=self.fee_journal_2.id,
        )
        self._sync_order([(self.bank_pm1, 100.0)])
        self.fee_account_2.deprecated = True
        self._close_session()
        lines = self.pos_session.fee_line_ids
        failed = lines.filtered(lambda line: line.journal_id == self.fee_journal_2)
        self.assertEqual(failed.state, "error")
        self.assertEqual((lines - failed).state, "posted")

    def test_posting_date_fallbacks(self):
        self._create_rule(amount=1.0)
        self._sync_order([(self.bank_pm1, 100.0)])
        line = self.pos_session.fee_line_ids
        self.assertFalse(self.pos_session.move_id)
        self.pos_session.stop_at = False
        self.assertFalse(line._get_posting_date())
        stop_at = fields.Datetime.now()
        self.pos_session.stop_at = stop_at
        self.assertEqual(line._get_posting_date(), self._today_for(line, stop_at))

    def test_undeterminable_posting_date_is_an_error(self):
        self._create_rule(amount=1.0)
        self._sync_order([(self.bank_pm1, 100.0)])
        line = self.pos_session.fee_line_ids
        self.pos_session.stop_at = False
        line.sudo()._post_fee_lines()
        self.assertEqual(line.state, "error")
        self.assertIn("accounting date", line.error_message)
        self.assertFalse(line.posting_date)

    def test_lock_empty_recordset(self):
        empty = self.env["pos.payment.fee.line"]
        self.assertFalse(empty._lock_for_posting())
        empty._post_fee_lines()

    def test_cannot_delete_posted_fee(self):
        self._create_rule(amount=1.0, posting_policy="immediate")
        self._create_rule(name="Pending", amount=1.0)
        order = self._sync_order([(self.bank_pm1, 100.0)])
        lines = order.payment_ids.fee_line_ids
        posted = lines.filtered(lambda line: line.state == "posted")
        with self.assertRaisesRegex(UserError, "cannot be deleted"):
            posted.sudo().unlink()
        (lines - posted).sudo().unlink()
        self.assertFalse((lines - posted).exists())

    def test_one_fee_per_payment_and_rule(self):
        self._create_rule(amount=1.0)
        order = self._sync_order([(self.bank_pm1, 100.0)])
        line = order.payment_ids.fee_line_ids
        with mute_logger("odoo.sql_db"), self.assertRaises(IntegrityError):
            with self.env.cr.savepoint():
                line.sudo().copy()
