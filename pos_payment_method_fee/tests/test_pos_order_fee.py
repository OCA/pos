from odoo.tests import tagged

from .common import TestPosPaymentFeeCommon


@tagged("post_install", "-at_install")
class TestPosOrderFee(TestPosPaymentFeeCommon):
    def setUp(self):
        super().setUp()
        self.open_new_session()

    def test_fee_line_snapshot_on_validated_order(self):
        rule = self._create_rule(amount=2.0)
        order = self._sync_order([(self.bank_pm1, 100.0)])
        line = order.payment_ids.fee_line_ids
        self.assertRecordValues(
            line,
            [
                {
                    "state": "pending",
                    "session_id": self.pos_session.id,
                    "pos_order_id": order.id,
                    "payment_method_id": self.bank_pm1.id,
                    "fee_rule_id": rule.id,
                    "company_id": self.company.id,
                    "currency_id": self.company.currency_id.id,
                    "amount_base": 100.0,
                    "fee_type": "percentage",
                    "fee_value": 2.0,
                    "fee_currency_id": False,
                    "fee_amount": 2.0,
                    "fee_amount_company": 2.0,
                    "account_id": self.fee_account.id,
                    "counterpart_account_id": self.outstanding_bank.id,
                    "journal_id": self.misc_journal.id,
                    "posting_policy": "session_close",
                    "grouping_policy": "grouped",
                    "move_id": False,
                    "posting_date": False,
                }
            ],
        )
        self.assertEqual(line.payment_date, order.payment_ids.payment_date)
        self.assertEqual(order.payment_ids.total_fee_amount, 2.0)
        self.assertEqual(order.amount_total, 100.0, "The order is never changed")

    def test_multiple_rules_are_cumulative(self):
        self._create_rule(amount=1.5)
        self._create_rule(name="Fixed", fee_type="fixed", amount=0.5)
        self._create_rule(name="Platform", amount=0.5)
        order = self._sync_order([(self.bank_pm1, 100.0)])
        lines = order.payment_ids.fee_line_ids
        self.assertEqual(sorted(lines.mapped("fee_amount")), [0.5, 0.5, 1.5])
        self.assertEqual(
            lines.filtered(lambda l: l.fee_type == "fixed").fee_currency_id,
            self.company.currency_id,
        )
        self.assertEqual(order.payment_ids.total_fee_amount, 2.5)

    def test_only_bank_payments_with_fees_enabled_generate_fees(self):
        self._create_rule()
        rule_split = self._create_rule(method=self.bank_split_pm1)
        order = self._sync_order(
            [(self.cash_pm1, 40.0), (self.bank_pm1, 40.0), (self.bank_split_pm1, 20.0)]
        )
        self.assertEqual(len(order.payment_ids), 3)
        lines = order.payment_ids.fee_line_ids
        self.assertEqual(lines.payment_method_id, self.bank_pm1)
        self.assertFalse(rule_split.payment_method_id.use_transaction_fees)

    def test_archived_rules_are_not_applied(self):
        self._create_rule().active = False
        order = self._sync_order([(self.bank_pm1, 100.0)])
        self.assertFalse(order.payment_ids.fee_line_ids)

    def test_zero_fee_is_not_recorded(self):
        self._create_rule(amount=0.0)
        order = self._sync_order([(self.bank_pm1, 100.0)])
        self.assertFalse(order.payment_ids.fee_line_ids)

    def test_draft_orders_do_not_generate_fees(self):
        """Draft orders are resynchronised by deleting and recreating their
        payments: fees are only computed once the order is validated."""
        self._create_rule()
        uid = self.create_random_uid()
        for _i in range(2):
            draft = self._sync_order([(self.bank_pm1, 100.0)], draft=True, uid=uid)
            self.assertEqual(draft.state, "draft")
            self.assertFalse(self.pos_session.fee_line_ids)
        order = self._sync_order([(self.bank_pm1, 100.0)], uid=uid)
        self.assertEqual(order, draft)
        self.assertEqual(order.state, "paid")
        self.assertEqual(len(self.pos_session.fee_line_ids), 1)

    def test_fee_computation_is_idempotent(self):
        self._create_rule()
        order = self._sync_order([(self.bank_pm1, 100.0)])
        order.action_pos_order_paid()
        self.assertEqual(len(order.payment_ids.fee_line_ids), 1)
        self._create_rule(name="New rule")
        order.action_pos_order_paid()
        self.assertEqual(len(order.payment_ids.fee_line_ids), 2)

    def test_refunds_do_not_generate_fees_by_default(self):
        self._create_rule(name="Sale only")
        self._create_rule(
            name="Fixed refund", fee_type="fixed", amount=0.3, apply_on_refunds=True
        )
        self._create_rule(name="Pct refund", amount=1.0, apply_on_refunds=True)
        refund = self._sync_order([(self.bank_pm1, -100.0)], quantity=-1)
        lines = refund.payment_ids.fee_line_ids
        self.assertEqual(
            lines.fee_rule_id.mapped("name"), ["Fixed refund", "Pct refund"]
        )
        self.assertEqual(sorted(lines.mapped("fee_amount")), [0.3, 1.0])
        self.assertTrue(all(amount > 0 for amount in lines.mapped("fee_amount")))
        self.assertEqual(lines.mapped("amount_base"), [-100.0, -100.0])

    def test_original_fee_is_kept_on_refund(self):
        self._create_rule()
        order = self._sync_order([(self.bank_pm1, 100.0)])
        refund = self.env["pos.order"].browse(order.refund()["res_id"])
        payment = (
            self.env["pos.make.payment"]
            .with_context(
                active_ids=refund.ids, active_id=refund.id, active_model="pos.order"
            )
            .create(
                {"payment_method_id": self.bank_pm1.id, "amount": refund.amount_total}
            )
        )
        payment.check()
        self.assertEqual(refund.state, "paid")
        self.assertFalse(refund.payment_ids.fee_line_ids)
        self.assertEqual(order.payment_ids.fee_line_ids.fee_amount, 1.5)

    def test_backend_payment_generates_fees(self):
        self._create_rule()
        order = self._sync_order([], draft=True)
        self.assertFalse(order.payment_ids)
        payment = (
            self.env["pos.make.payment"]
            .with_context(
                active_ids=order.ids, active_id=order.id, active_model="pos.order"
            )
            .create(
                {"payment_method_id": self.bank_pm1.id, "amount": order.amount_total}
            )
        )
        payment.check()
        self.assertEqual(order.state, "paid")
        self.assertEqual(len(order.payment_ids.fee_line_ids), 1)

    def test_pos_user_syncs_order_with_immediate_fee(self):
        self._create_rule(posting_policy="immediate")
        order = self._sync_order([(self.bank_pm1, 100.0)], user=self.pos_user)
        line = order.payment_ids.fee_line_ids
        self.assertEqual(line.state, "posted")
        self.assertEqual(line.move_id.state, "posted")

    def test_disabling_fees_with_open_session_is_not_retroactive(self):
        self._create_rule()
        first = self._sync_order([(self.bank_pm1, 100.0)])
        self.bank_pm1.use_transaction_fees = False
        second = self._sync_order([(self.bank_pm1, 100.0)])
        self.assertTrue(first.payment_ids.fee_line_ids)
        self.assertFalse(second.payment_ids.fee_line_ids)
        self._close_session()
        self.assertEqual(first.payment_ids.fee_line_ids.state, "posted")
