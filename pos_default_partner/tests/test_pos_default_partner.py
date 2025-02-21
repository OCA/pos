# copyright 2022 FactorLibre
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import odoo

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosDefaultPartner(TestPoSCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)
        cls.config = cls.basic_config
        cls.PosOrder = cls.env["pos.order"]
        # ==== Partners ====
        cls.partner_01 = cls.env["res.partner"].create({"name": "Test partner 1"})
        cls.partner_02 = cls.env["res.partner"].create({"name": "Test partner 2"})
        # ==== Products ====
        cls.product0 = cls.create_product("Product test 0", cls.categ_basic, 5.0, 0.0)
        cls.product1 = cls.create_product("Product test 1", cls.categ_basic, 10.0, 5)

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
