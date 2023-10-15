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

    def test_prepare_from_pos(self):
        self.partner = self.env["res.partner"].create({"name": "Test Partner"})
        self.product = self.env["product.product"].create(
            {"name": "Test Product", "default_code": "test_01"}
        )

        ICPSudo = self.env["ir.config_parameter"].sudo()
        ICPSudo.set_param("pos_order_to_sale_order.sol_name_mode", "product_pos")
        vals = self.env["sale.order.line"]._prepare_from_pos(
            {
                "product_id": self.product.id,
                "qty": 100,
                "discount": 0,
                "price_unit": 14.2,
                "customer_note": "Test Note",
                "tax_ids": False,
            }
        )
        self.assertEqual(
            vals.get("name"), "Test Product\nTest Note", msg="Name must be the same"
        )
        ICPSudo.set_param("pos_order_to_sale_order.sol_name_mode", "multiline")
        vals = self.env["sale.order.line"]._prepare_from_pos(
            {
                "product_id": self.product.id,
                "qty": 100,
                "discount": 0,
                "price_unit": 14.2,
                "customer_note": "Test Note",
                "tax_ids": False,
            }
        )
        self.assertNotIn("name", vals.keys(), msg="Name key must be contain in dict")
