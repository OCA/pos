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
    @mute_logger("odoo.models.unlink")
    def test_01_payment_change_policy_update(self):
        self.pos_config.payment_change_policy = "update"

        # Make a sale with 35 in cash journal and 65 in check
        order = self._sale(self.cash_payment_method, 35, self.bank_payment_method, 65)

        order_qty = len(self.PosOrder.search([]))

        with self.assertRaises(UserError):
            # Should not work if total is not correct
            self._change_payment(
                order, self.cash_payment_method, 10, self.cash_payment_method, 10
            )

        self._change_payment(
            order, self.cash_payment_method, 10, self.bank_payment_method, 90
        )

        self.bank_payment = self.session.order_ids.mapped("payment_ids").filtered(
            lambda x: x.payment_method_id == self.bank_payment_method
        )
        self.cash_payment = self.session.order_ids.mapped("payment_ids").filtered(
            lambda x: x.payment_method_id == self.cash_payment_method
        )
        # check Session
        self.assertEqual(
            self.cash_payment.amount,
            10,
            "Bad recompute of the balance for the statement cash",
        )

        self.assertEqual(
            self.bank_payment.amount,
            90,
            "Bad recompute of the balance for the statement check",
        )

        # Check Order quantity
        self.assertEqual(
            order_qty,
            len(self.PosOrder.search([])),
            "In 'Update' mode, changing payment should not create" " other PoS Orders",
        )

    def test_02_payment_change_policy_refund(self):
        self.pos_config.payment_change_policy = "refund"

        # Make a sale with 35 in cash journal and 65 in check
        order = self._sale(self.cash_payment_method, 35, self.bank_payment_method, 65)

        order_qty = len(self.PosOrder.search([]))

        self._change_payment(
            order, self.cash_payment_method, 50, self.bank_payment_method, 50
        )

        # Check Order quantity
        self.assertEqual(
            order_qty + 2,
            len(self.PosOrder.search([])),
            "In 'Refund' mode, changing payment should generate" " two new PoS Orders",
        )

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
    def test_04_payment_change_security(self):
        self.pos_config.payment_change_policy = "refund"
        order = self._sale(self.cash_payment_method, 35, self.bank_payment_method, 65)

        self._change_payment(order, self.cash_payment_method, 100)
