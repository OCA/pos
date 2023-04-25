# Copyright 2021 - Today Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import odoo
from odoo.exceptions import UserError

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestModule(TestPoSCommon):
    def setUp(self):
        super().setUp()
        self.PosOrder = self.env["pos.order"]
        self.config = self.basic_config

        product1 = self.create_product("Product 1", self.categ_basic, 10, 5)
        product2 = self.create_product("Product 2", self.categ_basic, 50, 30)

        # open a session
        self.open_new_session()

        # Create order
        res = self.env["pos.order"].create_from_ui(
            [self.create_ui_order_data([(product1, 2), (product2, 2)])]
        )

        self.paid_order = self.PosOrder.browse(res[0]["id"])

    def test_01_unlink_pos_order_line_state_paid(self):
        with self.assertRaises(UserError):
            self.paid_order.mapped("lines").unlink()

    def test_02_unlink_pos_order_line_state_draft(self):
        refund_order = self.PosOrder.browse(self.paid_order.refund()["res_id"])

        # Unlink lines of draft orders should be allowed
        refund_order.mapped("lines").unlink()
