# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import Command, fields
from odoo.exceptions import UserError
from odoo.tests import new_test_user, tagged
from odoo.tests.common import users
from odoo.tools import mute_logger

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@tagged("post_install", "-at_install")
class TestPosPaymentChange(TestPoSCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.PosOrder = cls.env["pos.order"]
        cls.product = cls.create_product("Test POS Product", cls.categ_basic, 10)
        cls.pos_config = cls.basic_config
        cls.bank_payment_method = cls.bank_pm1
        cls.cash_payment_method = cls.cash_pm1

        # create new session and open it
        cls.pos_config.open_ui()
        cls.session = cls.pos_config.current_session_id
        new_test_user(
            cls.env,
            login="test-pos-manager",
            groups="point_of_sale.group_pos_manager",
        )

    def _sale(self, payment_method_1, price_1, payment_method_2=False, price_2=0.0):
        price = price_1 + price_2
        order = self.PosOrder.create(
            {
                "session_id": self.session.id,
                "amount_tax": 0,
                "amount_total": price,
                "amount_paid": price,
                "amount_return": 0,
                "lines": [
                    Command.create(
                        {
                            "name": "OL/0001",
                            "product_id": self.product.id,
                            "qty": 1.0,
                            "price_unit": price,
                            "price_subtotal": price,
                            "price_subtotal_incl": price,
                        }
                    )
                ],
            }
        )
        order.add_payment(
            {
                "pos_order_id": order.id,
                "amount": price_1,
                "payment_date": fields.Date.today(),
                "payment_method_id": payment_method_1.id,
            }
        )
        if payment_method_2:
            order.add_payment(
                {
                    "pos_order_id": order.id,
                    "amount": price_2,
                    "payment_date": fields.Date.today(),
                    "payment_method_id": payment_method_2.id,
                }
            )
        order.action_pos_order_paid()
        return order

    def _change_payment(
        self, order, payment_method_1, amount_1, payment_method_2=False, amount_2=0.0
    ):
        # Switch to check journal
        new_line_vals = [
            Command.create(
                {
                    "new_payment_method_id": payment_method_1.id,
                    "amount": amount_1,
                }
            )
        ]
        if payment_method_2:
            new_line_vals += [
                Command.create(
                    {
                        "new_payment_method_id": payment_method_2.id,
                        "amount": amount_2,
                    }
                )
            ]
        wizard = (
            self.env["pos.payment.change.wizard"]
            .with_context(active_id=order.id)
            .create({"new_line_ids": new_line_vals})
        )
        wizard.button_change_payment()

    # Test Section
    def test_03_payment_change_closed_orders(self):
        self.pos_config.payment_change_policy = "update"

        # Make a sale with 35 in cash journal and 65 in check
        order = self._sale(self.cash_payment_method, 35, self.bank_payment_method, 65)

        self.session.state = "closed"

        with self.assertRaises(UserError):
            self._change_payment(
                order, self.cash_payment_method, 10, self.bank_payment_method, 90
            )

    @users("test-pos-manager")
    def test_04_payment_change_security_01(self):
        self.pos_config.payment_change_policy = "refund"
        order = self._sale(self.cash_payment_method, 35, self.bank_payment_method, 65)

        self.assertEqual(order.state, "paid")
        self.assertEqual(len(order.payment_ids), 2)
        self.assertEqual(order.amount_paid, 100)
        self._change_payment(order, self.cash_payment_method, 100)
        refund = order.mapped("lines.refund_orderline_ids.order_id")
        self.assertEqual(refund.state, "paid")
        self.assertEqual(len(refund.payment_ids), 2)
        self.assertEqual(refund.amount_paid, -100)
        cash_refund_payment = refund.payment_ids.filtered(
            lambda x: x.payment_method_id == self.cash_payment_method
        )
        self.assertEqual(cash_refund_payment.amount, -35)
        bank_refund_payment = refund.payment_ids.filtered(
            lambda x: x.payment_method_id == self.bank_payment_method
        )
        self.assertEqual(bank_refund_payment.amount, -65)
        resale_order = self.env["pos.order"].search(
            [
                ("pos_reference", "=", order.pos_reference),
                ("session_id", "=", order.session_id.id),
                ("id", "not in", (order + refund).ids),
            ]
        )
        self.assertEqual(resale_order.state, "paid")
        self.assertEqual(resale_order.amount_paid, 100)
        self.assertEqual(len(resale_order.payment_ids), 1)
        self.assertEqual(
            resale_order.payment_ids.payment_method_id, self.cash_payment_method
        )

    @users("test-pos-manager")
    def test_04_payment_change_security_02(self):
        self.pos_config.payment_change_policy = "refund"
        order = self._sale(self.cash_payment_method, 100)
        self.assertEqual(order.state, "paid")
        self.assertEqual(len(order.payment_ids), 1)
        self.assertEqual(order.amount_paid, 100)
        self._change_payment(order, self.bank_payment_method, 100)
        refund = order.mapped("lines.refund_orderline_ids.order_id")
        self.assertEqual(refund.state, "paid")
        self.assertEqual(len(refund.payment_ids), 1)
        self.assertEqual(refund.amount_paid, -100)
        self.assertEqual(refund.payment_ids.payment_method_id, self.cash_payment_method)
        resale_order = self.env["pos.order"].search(
            [
                ("pos_reference", "=", order.pos_reference),
                ("session_id", "=", order.session_id.id),
                ("id", "not in", (order + refund).ids),
            ]
        )
        self.assertEqual(resale_order.state, "paid")
        self.assertEqual(resale_order.amount_paid, 100)
        self.assertEqual(len(resale_order.payment_ids), 1)
        self.assertEqual(
            resale_order.payment_ids.payment_method_id, self.bank_payment_method
        )

    @mute_logger("odoo.models.unlink")
    def test_05_payment_change_update_invoiced_orders(self):
        self.pos_config.payment_change_policy = "update"
        customer = self.env["res.partner"].create({"name": "Test customer"})
        price = 100
        order = self.PosOrder.create(
            {
                "session_id": self.session.id,
                "partner_id": customer.id,
                "amount_tax": 0,
                "amount_total": price,
                "amount_paid": price,
                "amount_return": 0,
                "to_invoice": True,
                "lines": [
                    Command.create(
                        {
                            "name": "OL/0001",
                            "product_id": self.product.id,
                            "qty": 1.0,
                            "price_unit": price,
                            "price_subtotal": price,
                            "price_subtotal_incl": price,
                        }
                    )
                ],
            }
        )
        order.add_payment(
            {
                "pos_order_id": order.id,
                "amount": price,
                "payment_date": "2026-01-01",
                "payment_method_id": self.cash_payment_method.id,
            }
        )
        order.action_pos_order_invoice()
        self.assertEqual(order.state, "invoiced")
        invoice = order.account_move
        self.assertEqual(len(order.payment_ids), 1)
        old_move = order.payment_ids.account_move_id
        # Change payment (from cash to bank)
        self._change_payment(order, self.bank_payment_method, 100)
        self.assertEqual(len(order.payment_ids), 1)
        payment = order.payment_ids
        self.assertEqual(payment.payment_method_id, self.bank_payment_method)
        self.assertEqual(payment.amount, 100)
        self.assertEqual(payment.payment_date.date(), fields.Date.today())
        self.assertFalse(old_move.exists())
        self.assertEqual(order.state, "invoiced")
        self.assertEqual(invoice.state, "posted")
        self.assertEqual(invoice.payment_state, "paid")
        new_move = order.payment_ids.account_move_id
        self.assertEqual(new_move.state, "posted")
        self.assertEqual(new_move.date, fields.Date.today())
        # Change payment_again (80 cash, 20 bank)
        self._change_payment(
            order, self.cash_payment_method, 80, self.bank_payment_method, 20
        )
        self.assertFalse(new_move.exists())
        self.assertEqual(len(order.payment_ids), 2)
        cash_payment = order.payment_ids.filtered(
            lambda x: x.payment_method_id == self.cash_payment_method
        )
        self.assertEqual(cash_payment.amount, 80)
        cash_payment_move = cash_payment.account_move_id
        self.assertEqual(cash_payment_move.state, "posted")
        self.assertEqual(cash_payment_move.amount_total, 80)
        bank_payment = order.payment_ids.filtered(
            lambda x: x.payment_method_id == self.bank_payment_method
        )
        self.assertEqual(bank_payment.amount, 20)
        bank_payment_move = bank_payment.account_move_id
        self.assertEqual(bank_payment_move.state, "posted")
        self.assertEqual(bank_payment_move.amount_total, 20)
        self.assertEqual(invoice.state, "posted")
        self.assertEqual(invoice.payment_state, "paid")

    @mute_logger("odoo.models.unlink")
    def test_06_payment_change_refund_invoiced_orders(self):
        self.pos_config.payment_change_policy = "refund"
        customer = self.env["res.partner"].create({"name": "Test customer"})
        price = 100
        order = self.PosOrder.create(
            {
                "session_id": self.session.id,
                "partner_id": customer.id,
                "amount_tax": 0,
                "amount_total": price,
                "amount_paid": price,
                "amount_return": 0,
                "to_invoice": True,
                "lines": [
                    Command.create(
                        {
                            "name": "OL/0001",
                            "product_id": self.product.id,
                            "qty": 1.0,
                            "price_unit": price,
                            "price_subtotal": price,
                            "price_subtotal_incl": price,
                        }
                    )
                ],
            }
        )
        order.add_payment(
            {
                "pos_order_id": order.id,
                "amount": price,
                "payment_date": "2026-01-01",
                "payment_method_id": self.cash_payment_method.id,
            }
        )
        order.action_pos_order_invoice()
        self.assertEqual(order.state, "invoiced")
        invoice = order.account_move
        self.assertEqual(len(order.payment_ids), 1)
        old_move = order.payment_ids.account_move_id
        # Change payment (from cash to bank)
        self._change_payment(order, self.bank_payment_method, 100)
        self.assertEqual(order.amount_paid, 100)
        self.assertEqual(len(order.payment_ids), 1)
        payment = order.payment_ids
        self.assertEqual(payment.payment_method_id, self.cash_payment_method)
        self.assertEqual(payment.amount, 100)
        self.assertEqual(
            payment.payment_date.date(), fields.Date.from_string("2026-01-01")
        )
        self.assertTrue(old_move.exists())
        self.assertEqual(old_move.state, "posted")
        self.assertEqual(order.state, "invoiced")
        self.assertEqual(invoice.state, "posted")
        self.assertEqual(invoice.payment_state, "paid")
        refund = order.mapped("lines.refund_orderline_ids.order_id")
        self.assertEqual(refund.state, "invoiced")
        self.assertEqual(len(refund.payment_ids), 1)
        refund_payment = refund.payment_ids
        self.assertTrue(refund_payment.account_move_id)
        self.assertEqual(refund_payment.account_move_id.state, "posted")
        self.assertEqual(refund_payment.payment_method_id, self.cash_payment_method)
        self.assertEqual(refund_payment.amount, -100)
        self.assertEqual(refund.amount_paid, -100)
        self.assertEqual(refund.state, "invoiced")
        refund_invoice = refund.account_move
        self.assertEqual(refund_invoice.move_type, "out_refund")
        self.assertEqual(refund_invoice.state, "posted")
        self.assertEqual(refund_invoice.payment_state, "reversed")
        resale_order = self.env["pos.order"].search(
            [
                ("pos_reference", "=", order.pos_reference),
                ("session_id", "=", order.session_id.id),
                ("id", "not in", (order + refund).ids),
            ]
        )
        self.assertEqual(resale_order.state, "invoiced")
        self.assertEqual(resale_order.amount_paid, 100)
        self.assertEqual(len(resale_order.payment_ids), 1)
        resale_payment = resale_order.payment_ids
        self.assertTrue(resale_payment.account_move_id)
        self.assertEqual(resale_payment.account_move_id.state, "posted")
        self.assertEqual(resale_payment.payment_method_id, self.bank_payment_method)
        self.assertEqual(resale_payment.amount, 100)
        extra_invoice = resale_order.account_move
        self.assertEqual(extra_invoice.move_type, "out_invoice")
        self.assertEqual(extra_invoice.state, "posted")
        self.assertEqual(extra_invoice.payment_state, "paid")
