# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields
from odoo.exceptions import UserError
from odoo.tests import Form
from odoo.tests.common import SavepointCase


class TestModule(SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestModule, cls).setUpClass()

        # Get Registry
        cls.PosOrder = cls.env["pos.order"]
        cls.AccountPayment = cls.env["account.payment.register"]

        # Get Object
        cls.pos_product = cls.env.ref("point_of_sale.whiteboard_pen")
        cls.pricelist = cls.env.ref("product.list0")
        cls.partner = cls.env.ref("base.res_partner_12")

        # Create a new pos config and open it
        cls.pos_config = cls.env.ref("point_of_sale.pos_config_main").copy()
        cls.pos_config.open_session_cb()

    def test_order_invoice(self):
        order = self._create_order()

        order.action_pos_order_invoice()

        self.assertEqual(order.account_move.pos_pending_payment, True)

        with self.assertRaises(UserError):
            account_move = order.account_move
            account_move.button_draft()
            account_move.button_cancel()

        with self.assertRaises(UserError):
            account_move = order.account_move
            account_move.action_register_payment()
            action_data = account_move.action_register_payment()
            wizard = Form(
                self.env["account.payment.register"].with_context(action_data)
            ).save()
            wizard.action_create_payments()

        self.register_payment(order.account_move.id)
        action_data = order.account_move.action_register_payment()
        wizard = Form(
            self.env["account.payment.register"].with_context(action_data["context"])
        ).save()
        wizard.action_create_payments()

        # Once closed check if the invoice is correctly set
        self.pos_config.current_session_id.action_pos_session_closing_control()
        self.assertEqual(order.account_move.pos_pending_payment, False)

    def _create_order(self):
        # Create order
        user = self.env.user
        order_data = {
            "id": "0006-001-0010",
            "to_invoice": True,
            "data": {
                "pricelist_id": self.pricelist.id,
                "user_id": 1,
                "name": "Order 0006-001-0010",
                "partner_id": self.partner.id,
                "amount_paid": 0.9,
                "pos_session_id": self.pos_config.current_session_id.id,
                "lines": [
                    [
                        0,
                        0,
                        {
                            "product_id": self.pos_product.id,
                            "price_unit": 0.9,
                            "qty": 1,
                            "price_subtotal": 0.9,
                            "price_subtotal_incl": 0.9,
                        },
                    ]
                ],
                "statement_ids": [
                    [
                        0,
                        0,
                        {
                            "journal_id": self.pos_config.journal_id.id,
                            "amount": 0.9,
                            "name": fields.Datetime.now(),
                            "account_id": user.partner_id.property_account_receivable_id.id,
                            "statement_id": self.pos_config.current_session_id.statement_ids[
                                0
                            ].id,
                            "payment_method_id": self.pos_config.payment_method_ids[
                                0
                            ].id,
                        },
                    ]
                ],
                "creation_date": "2018-09-27 15:51:03",
                "amount_tax": 0,
                "fiscal_position_id": False,
                "uid": "00001-001-0001",
                "amount_return": 0,
                "sequence_number": 1,
                "amount_total": 0.9,
            },
        }

        result = self.PosOrder.create_from_ui([order_data])
        order = self.PosOrder.browse(result[0]["id"])
        return order

    def register_payment(self, invoice_id=False):
        journal = self.pos_config.payment_method_ids[0]
        payment_id = self.AccountPayment.with_context(
            active_model="account.move", active_ids=invoice_id
        ).create(
            {
                "payment_type": "inbound",
                "partner_type": "customer",
                "payment_date": fields.Datetime.now(),
                "partner_id": self.partner.id,
                "amount": 0.9,
                "journal_id": journal.id,
                "payment_method_id": journal.cash_journal_id.inbound_payment_method_ids[
                    0
                ].id,
            }
        )

        return payment_id
