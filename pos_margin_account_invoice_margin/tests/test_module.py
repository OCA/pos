# Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import odoo

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestModule(TestPoSCommon):
    def setUp(self):
        super().setUp()
        self.config = self.basic_config
        self.product1 = self.create_product("Product 1", self.categ_basic, 10, 7)

    def test_margin_on_invoice(self):
        self.open_new_session()

        order_data = self.create_ui_order_data(
            [(self.product1, 100)], customer=self.customer, is_invoiced=True
        )

        order_result = self.env["pos.order"].create_from_ui([order_data])
        order = self.env["pos.order"].browse(order_result[0]["id"])
        # Test to prevent regression
        self.assertEqual(order.margin, 300)
        self.assertEqual(order.margin_percent, 0.3)

        # Test correct data on account move lines
        self.assertEqual(order.account_move.invoice_line_ids[0].purchase_price, 7)
        self.assertEqual(order.account_move.invoice_line_ids[0].margin, 300)
        self.assertEqual(order.account_move.invoice_line_ids[0].margin_percent, 30)
