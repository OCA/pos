# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html


from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    def test_pos_order_to_sale_order(self):
        self.main_pos_config.open_ui()

        # Make the test compatible with pos_minimize_menu
        if "iface_important_buttons" in self.main_pos_config._fields:
            self.main_pos_config.iface_important_buttons = "CreateOrderButton"

        before_orders = self.env["sale.order"].search(
            [("partner_id", "=", self.env.ref("base.res_partner_address_31").id)],
            order="id",
        )

        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "PosOrderToSaleOrderTour",
            login="accountman",
        )

        after_orders = self.env["sale.order"].search(
            [("partner_id", "=", self.env.ref("base.res_partner_address_31").id)],
            order="id",
        )

        self.assertEqual(len(before_orders) + 1, len(after_orders))

        order = after_orders[-1]

        self.assertEqual(order.amount_total, 3.2)
        self.assertEqual(order.state, "sale")
        self.assertEqual(order.delivery_status, "full")
        self.assertEqual(order.invoice_status, "invoiced")
