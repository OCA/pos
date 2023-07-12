# Copyright 2022 KMEE (<http://www.kmee.com.br>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields
from odoo.tests.common import TransactionCase


class TestPosAskVat(TransactionCase):
    def setUp(self):
        super(TestPosAskVat, self).setUp()
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
                "customer_tax_id": "1234567890",
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

        result = self.PosOrder.create_from_ui([order_data])
        order = self.PosOrder.browse(result[0].get("id"))
        return order

    def test_pos_order_with_customer_vat(self):
        order = self._create_order()
        self.assertEqual(order.customer_tax_id, "1234567890")
