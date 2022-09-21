# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.exceptions import UserError, ValidationError
from odoo.tests.common import TransactionCase


class TestMultipleControl(TransactionCase):
    """Tests for 'Point of Sale - Multiple Control' Module"""

    def setUp(self):
        super(TestMultipleControl, self).setUp()
        self.session_obj = self.env["pos.session"]
        self.order_obj = self.env["pos.order"]
        self.payment_obj = self.env["pos.make.payment"]
        self.partner = self.env.ref("base.partner_demo_portal")
        self.product = self.env.ref("product.product_product_3")
        self.pos_move_reason = self.env.ref("pos_multiple_control.cash_register_error")
        self.pos_config = self.env.ref("pos_multiple_control.pos_config_control")
        self.cash_payment_method = self.env.ref(
            "pos_multiple_control.cash_payment_method"
        )

    def _order(self, session, price, journal):
        # I create a new PoS order with 2 lines
        order = self.order_obj.create(
            {
                "session_id": session.id,
                "partner_id": self.partner.id,
                "pricelist_id": self.partner.property_product_pricelist.id,
                "lines": [
                    (
                        0,
                        0,
                        {
                            "name": "OL/0001",
                            "product_id": self.product.id,
                            "price_unit": price,
                            "qty": 1.0,
                            "tax_ids": [(6, 0, self.product.taxes_id.ids)],
                            "price_subtotal": price,
                            "price_subtotal_incl": price,
                        },
                    )
                ],
                "amount_total": price,
                "amount_tax": 0.0,
                "amount_paid": 0.0,
                "amount_return": 0.0,
            }
        )
        return order

    def _order_and_pay(self, session, price, payment_method):
        order = self._order(session, price, payment_method)
        context_make_payment = {"active_ids": [order.id], "active_id": order.id}
        self.pos_make_payment = self.payment_obj.with_context(
            context_make_payment
        ).create({"amount": price, "payment_method_id": payment_method.id})

        # I click on the validate button to register the payment.
        context_payment = {"active_id": order.id}
        self.pos_make_payment.with_context(context_payment).check()

        return order

    # Test Section
    def test_01_two_opening_session(self):
        # I create new session
        self.session_obj.create({"config_id": self.pos_config.id})

        # I Try to create a new session
        with self.assertRaises(ValidationError):
            self.session_obj.create({"config_id": self.pos_config.id})

    def test_02_opening_and_opened_session(self):
        # I create new session and open it
        session = self.session_obj.create({"config_id": self.pos_config.id})
        self.pos_config.open_session_cb()
        self.pos_config._open_session(session.id)

        # I Try to create a new session
        with self.assertRaises(ValidationError):
            self.session_obj.create({"config_id": self.pos_config.id})

    def test_03_check_close_session_with_draft_order(self):
        # I create new session and open it
        session = self.session_obj.create({"config_id": self.pos_config.id})
        self.pos_config.open_session_cb()
        self.pos_config._open_session(session.id)

        # Create a Draft order, and try to close the session
        self._order(session, 1, self.cash_payment_method)

        with self.assertRaises(UserError):
            session.wkf_action_closing_control()

    def test_04_check_bank_statement_control(self):
        # I create new session and open it
        session = self.session_obj.create({"config_id": self.pos_config.id})

        # Make 2 Sales of 1100 and check transactions and theoritical balance
        self.pos_config.open_session_cb()
        self.pos_config._open_session(session.id)
        self._order_and_pay(session, 100, self.cash_payment_method)
        self._order_and_pay(session, 1000, self.cash_payment_method)
        session._validate_session()
        self.assertEqual(
            session.control_register_total_entry_encoding,
            1100,
            "Incorrect transactions total",
        )
        self.assertEqual(
            session.control_register_balance_end,
            session.control_register_balance_start + 1100,
            "Incorrect theoritical ending balance",
        )

    def test_05_check_autosolve(self):
        # I create new session and open it
        self.pos_config.write(
            {
                "autosolve_pos_move_reason": self.pos_move_reason.id,
                "autosolve_limit": 20,
            }
        )
        session = self.session_obj.create({"config_id": self.pos_config.id})

        # Make sales and autosolve
        self.pos_config.open_session_cb()
        self.pos_config._open_session(session.id)
        sale = self._order_and_pay(session, 18, self.cash_payment_method)
        session._validate_session()
        sale.session_id.statement_ids[0].balance_end_real = 0.0
        sale.session_id.statement_ids[0].state = "open"
        sale.session_id.statement_ids[0].automatic_solve()
        self.assertEqual(
            session.summary_statement_ids.filtered(
                lambda x: x.is_pos_control
            ).control_difference,
            0.0,
            "Incorrect transactions total",
        )

    def test_06_check_display_button(self):
        # I create new session and open it
        self.pos_config.write(
            {
                "autosolve_pos_move_reason": self.pos_move_reason.id,
                "autosolve_limit": 30,
            }
        )
        session = self.session_obj.create({"config_id": self.pos_config.id})

        # Make sales too important
        self.pos_config.open_session_cb()
        self.pos_config._open_session(session.id)
        sale = self._order_and_pay(session, 31, self.cash_payment_method)
        self.assertEqual(
            sale.session_id.statement_ids[0].display_autosolve,
            False,
            "Autosolve button should be hidden",
        )
