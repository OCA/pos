# Copyright 2022 KMEE (<http://www.kmee.com.br>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields
from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase


class TestPosOrderCancelItems(TransactionCase):
    def setUp(self):
        super(TestPosOrderCancelItems, self).setUp()
        self.PosOrder = self.env["pos.order"]
        self.pos_product = self.env.ref("point_of_sale.whiteboard_pen")
        self.pricelist = self.env.ref("product.list0")

        # Create a new pos config and open it
        self.pos_config = self.env.ref("point_of_sale.pos_config_main").copy()
        pos_receivable_account = self.env["account.account"].create(
            {
                "code": "X1012 - POS",
                "name": "Debtors - (POS)",
                "reconcile": True,
                "user_type_id": self.env.ref("account.data_account_type_receivable").id,
            }
        )
        bank_payment_method = self.env["pos.payment.method"].create(
            {
                "name": "Bank",
                "receivable_account_id": pos_receivable_account.id,
                "is_cash_count": False,
                "company_id": self.env.company.id,
            }
        )
        self.pos_config.write({"payment_method_ids": [(4, bank_payment_method.id)]})
        self.pos_config.open_session_cb()
        self.CancelReason = self.env["pos.cancel.reason"]
        self.cancel_reason = self.CancelReason.create({"name": "Reason 1"})

    def _create_order(self, cancelled=False):
        # Create order
        account_id = self.env.user.partner_id.property_account_receivable_id.id
        order_data = {
            "id": "0006-001-0010",
            "to_invoice": False,
            "data": {
                "pricelist_id": self.pricelist.id,
                "user_id": 1,
                "name": "Order 0006-001-0010",
                "partner_id": False,
                "amount_paid": 0.9,
                "pos_session_id": self.pos_config.current_session_id.id,
                "lines": [
                    [
                        0,
                        0,
                        {
                            "product_id": self.pos_product.id,
                            "price_unit": self.pos_product.list_price,
                            "qty": 10,
                            "price_subtotal": 18.0,
                            "price_subtotal_incl": 18.0,
                        },
                    ]
                ],
                "cancelled_orderlines": [
                    {
                        "order_id": "Order 0006-001-0010",
                        "product_id": self.pos_product.id,
                        "price_unit": self.pos_product.list_price,
                        "qty": 2,
                        "price_subtotal": 3.6,
                        "cancel_reason_id": self.cancel_reason.id,
                        "cancelled_at": "2018-09-27T15:31:03Z",
                    }
                ],
                "statement_ids": [
                    [
                        0,
                        0,
                        {
                            "payment_method_id": self.pos_config.payment_method_ids[
                                0
                            ].id,
                            "amount": 18.0,
                            "name": fields.Datetime.now(),
                            "account_id": account_id,
                            "session_id": self.pos_config.current_session_id.id,
                        },
                    ]
                ],
                "creation_date": "2018-09-27 15:51:03",
                "amount_tax": 0,
                "fiscal_position_id": False,
                "uid": "00001-001-0001",
                "amount_return": 0,
                "sequence_number": 1,
                "amount_total": 18.0,
            },
        }

        if cancelled:
            order_data["id"] = "0006-001-0011"
            order_data["data"]["name"] = "0006-001-0011"
            order_data["data"]["cancelled_orderlines"] = []
            order_data["data"]["statement_ids"] = []
            order_data["data"]["state"] = "cancel"
            order_data["data"]["cancel_reason_id"] = self.cancel_reason.id

        result = self.PosOrder.create_from_ui([order_data])
        order = self.PosOrder.browse(result[0].get("id"))
        return order

    def test_pos_order_with_cancelled_items(self):
        order = self._create_order()
        self.assertEqual(len(order.cancelled_line_ids), 1)

    def test_cancelled_pos_order(self):
        order = self._create_order(cancelled=True)
        self.assertEqual(order.state, "cancel")

    def test_unlink_cancelled_pos_order_with_reason(self):
        order = self._create_order(cancelled=True)
        with self.assertRaises(ValidationError) as e, self.env.cr.savepoint():
            order.unlink()

        self.assertTrue(
            "You can't delete an order with a cancel reason!",
            e.exception.args[0],
        )

    def test_write_cancel_reason_name(self):
        self._create_order(cancelled=True)

        with self.assertRaises(ValidationError):
            self.cancel_reason.write({"name": "TEST WRITE"})
