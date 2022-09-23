# copyright 2022 FactorLibre
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import odoo

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosDefaultPartner(TestPoSCommon):
    def setUp(self):
        super().setUp()
        self.config = self.basic_config
        self.PosOrder = self.env["pos.order"]
        # ==== Partners ====
        self.partner_01 = self.env["res.partner"].create({"name": "Test partner 1"})
        self.partner_02 = self.env["res.partner"].create({"name": "Test partner 2"})
        # ==== Products ====
        self.product0 = self.create_product(
            "Product test 0", self.categ_basic, 5.0, 0.0
        )
        self.product1 = self.create_product("Product test 1", self.categ_basic, 10.0, 5)

    def _create_order(self, partner_id=False):
        # ==== open a session ====
        self.open_new_session()
        # ==== create order ====
        orders = [
            self.create_ui_order_data(
                [(self.product0, 3), (self.product1, 20)], partner_id
            )
        ]
        result = self.env["pos.order"].create_from_ui(orders)
        order = self.PosOrder.browse(result[0]["id"])
        return order

    def test_no_default_partner(self):
        order = self._create_order()
        self.assertTrue(order)
        self.assertFalse(order.partner_id)

    def test_no_default_partner_assigned_partner(self):
        order = self._create_order(self.partner_01)
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_01)

    def test_default_partner(self):
        self.config.default_partner_id = self.partner_02
        order = self._create_order()
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_02)

    def test_default_partner_assigned_partner(self):
        self.config.default_partner_id = self.partner_02
        order = self._create_order(self.partner_01)
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_01)
