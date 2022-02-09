# Copyright 2019 - Today Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields
from odoo.tests.common import TransactionCase


class TestModule(TransactionCase):
    def setUp(self):
        super(TestModule, self).setUp()
        self.PosOrder = self.env["pos.order"]
        self.pos_product = self.env.ref("point_of_sale.whiteboard_pen")
        self.pricelist = self.env["product.pricelist"].create(
            {
                "name": "Test pricelist",
                "currency_id": self.env.user.company_id.currency_id.id,
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "applied_on": "3_global",
                            "compute_price": "formula",
                            "base": "list_price",
                        },
                    )
                ],
            }
        )
        # Create a new pos config and open it
        self.pos_config = self.env.ref("point_of_sale.pos_config_main").copy(
            {
                "available_pricelist_ids": [(6, 0, self.pricelist.ids)],
                "pricelist_id": self.pricelist.id,
            }
        )
        self.pos_config.open_session_cb()
        self.payment_method = self.pos_config.payment_method_ids[0].id

    def test_margin(self):
        self.pos_product.list_price = 1.8
        self.pos_product.standard_price = 0.5
        order = self._create_order()
        self.assertEqual(order[0].margin, 10 * (1.8 - 0.5), "Bad computation of margin")

    def _create_order(self):
        # Create order
        account_id = self.env.user.partner_id.property_account_receivable_id.id
        statement_id = self.pos_config.current_session_id.statement_ids[0].id
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
                            "journal_id": self.pos_config.journal_id.id,
                            "amount": 18.0,
                            "name": fields.Datetime.now(),
                            "account_id": account_id,
                            "statement_id": statement_id,
                            "payment_method_id": self.payment_method,
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
        order = self.PosOrder.search([("id", "=", result[0].get("id"))])
        return order
