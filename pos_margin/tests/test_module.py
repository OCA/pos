# Copyright 2019 - Today Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields
from odoo.tests.common import TransactionCase


class TestModule(TransactionCase):
    def setUp(self):
        super(TestModule, self).setUp()
        self.PosOrder = self.env["pos.order"]
        self.pos_product = self.env.ref("point_of_sale.whiteboard_pen")
        self.pricelist = self.env.ref("product.list0")

        # Create a new pos config and open it
        self.pos_config = self.env.ref("point_of_sale.pos_config_main").copy()
        self.pos_config.open_session_cb()

    def test_margin(self):
        self.pos_product.list_price = 1.8
        self.pos_product.standard_price = 0.5
        order = self._create_order()

        self.assertEqual(order.margin, 10 * (1.8 - 0.5), "Bad computation of margin")

    def _create_order(self):
        # Create order
        account_id = self.env.user.partner_id.property_account_receivable_id.id
        order_data = {
            "id": u"0006-001-0010",
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
                "creation_date": u"2018-09-27 15:51:03",
                "amount_tax": 0,
                "fiscal_position_id": False,
                "uid": u"00001-001-0001",
                "amount_return": 0,
                "sequence_number": 1,
                "amount_total": 18.0,
            },
        }
        result = self.PosOrder.create_from_ui([order_data])
        order = self.PosOrder.browse(result[0].get("id"))
        return order
