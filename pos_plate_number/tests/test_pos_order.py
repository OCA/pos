# Copyright 2023 KMEE
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import odoo

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPlateNumberPosOrder(TestPoSCommon):
    def setUp(self):
        super(TestPlateNumberPosOrder, self).setUp()

        self.config = self.basic_config
        self.product1 = self.create_product("Product 1", self.categ_basic, 10.0, 5)
        self.product2 = self.create_product("Product 2", self.categ_basic, 20.0, 10)
        self.adjust_inventory([self.product1, self.product2], [50, 50])

    def test_create_plate_number(self):
        self.open_new_session()

        order_data = self.create_ui_order_data(
            [(self.product1, 5)], payments=[(self.cash_pm, 50)], customer=self.customer
        )
        order_data["data"]["plate_number"] = "dummy"

        res = self.env["pos.order"].create_from_ui([order_data])
        order_id = self.env["pos.order"].browse(res[0].get("id"))

        self.assertEqual(order_id.plate_number, "dummy")

        export = order_id.export_for_ui()[0]
        self.assertIn("plate_number", export)
        self.assertEqual(export["plate_number"], "dummy")
