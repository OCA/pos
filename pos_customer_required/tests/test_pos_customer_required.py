import odoo.tests.common as common
from odoo import exceptions


class TestPosCustomerRequired(common.TransactionCase):
    def setUp(self):
        super().setUp()
        self.pos_config = self.env.ref("point_of_sale.pos_config_main").copy()
        self.account = self.env["account.account"].create(
            {
                "name": "Receivable",
                "code": "RCV00",
                "account_type": "asset_receivable",
                "reconcile": True,
            }
        )
        self.cash_journal = self.env["account.journal"].create(
            {"name": "CASH journal", "type": "cash", "code": "CSH00"}
        )
        self.cash_payment_method = self.env["pos.payment.method"].create(
            {
                "name": "Cash Test",
                "journal_id": self.cash_journal.id,
                "receivable_account_id": self.account.id,
            }
        )
        self.PosMakePayment = self.env["pos.make.payment"]

    def test_customer_not_required(self):
        self.pos_config.require_customer = "no"

        # Now Create new session and create a
        # pos order in this session
        pos_session = self.env["pos.session"].create(
            {"user_id": 1, "config_id": self.pos_config.id}
        )
        # should not raise any exception
        self.env["pos.order"].create(
            {
                "session_id": pos_session.id,
                "partner_id": False,
                "amount_tax": 0.0,
                "amount_total": 0.0,
                "amount_paid": 0.0,
                "amount_return": 0.0,
            }
        )

    def test_customer_is_required(self):
        self.pos_config.require_customer = "order"

        # Now Create new session and create a
        # pos order in this session
        pos_session = self.env["pos.session"].create(
            {"user_id": 1, "config_id": self.pos_config.id}
        )
        # should raise exceptions.ValidationError
        with self.assertRaises(exceptions.ValidationError):
            self.env["pos.order"].create(
                {
                    "session_id": pos_session.id,
                    "partner_id": False,
                    "amount_tax": 0.0,
                    "amount_total": 0.0,
                    "amount_paid": 0.0,
                    "amount_return": 0.0,
                }
            )

    def test_customer_is_required_payment(self):
        self.pos_config.require_customer = "payment"

        # Now Create new session and create a
        # pos order in this session
        pos_session = self.env["pos.session"].create(
            {"user_id": 1, "config_id": self.pos_config.id}
        )
        pos_order = self.env["pos.order"].create(
            {
                "session_id": pos_session.id,
                "partner_id": False,
                "amount_tax": 0.0,
                "amount_total": 0.0,
                "amount_paid": 0.0,
                "amount_return": 0.0,
            }
        )
        context_make_payment = {"active_ids": [pos_order.id], "active_id": pos_order.id}
        pos_make_payment = self.PosMakePayment.with_context(
            **context_make_payment
        ).create(
            {
                "amount": 0.0,
                "payment_method_id": self.cash_payment_method.id,
            }
        )
        context_payment = {"active_id": pos_order.id}
        with self.assertRaises(exceptions.UserError):
            pos_make_payment.with_context(**context_payment).check()
