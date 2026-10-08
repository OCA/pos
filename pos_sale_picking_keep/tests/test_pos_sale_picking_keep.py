# Copyright 2026 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import odoo.tests
from odoo import Command
from odoo.tests import Form

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosSalePickingKeep(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env.user.group_ids |= cls.env.ref("sales_team.group_sale_salesman")
        cls.env.company.point_of_sale_update_stock_quantities = "closing"
        cls.customer = cls.env["res.partner"].create({"name": "Test partner"})
        cls.warehouse = cls.env["stock.warehouse"].search(
            [("company_id", "=", cls.env.company.id)], limit=1
        )
        cls.product = cls.env["product.product"].create(
            {
                "name": "Test Product",
                "available_in_pos": True,
                "is_storable": True,
                "lst_price": 10.0,
            }
        )
        cls.main_pos_config.name = "test_pos_sale_picking_keep"

    def test_sale_order_pos_order_done(self):
        self.env["stock.quant"]._update_available_quantity(
            self.product, self.warehouse.lot_stock_id, 1
        )
        order_form = Form(self.env["sale.order"])
        order_form.partner_id = self.customer
        order_form.client_order_ref = "test_pos_sale_picking_keep"
        with order_form.order_line.new() as line_form:
            line_form.product_id = self.product
        sale_order = order_form.save()
        sol = sale_order.order_line
        self.assertEqual(sol.qty_delivered, 0)
        self.main_pos_config.open_ui()
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "PosSalePickingKeep1",
            login="accountman",
        )
        self.assertEqual(sale_order.state, "sale")
        self.assertEqual(len(sale_order.picking_ids), 1)
        pos_order = sol.pos_order_line_ids.order_id
        self.assertEqual(pos_order.state, "paid")
        self.assertFalse(pos_order.picking_ids)
        so_picking = sale_order.picking_ids
        self.assertEqual(so_picking.state, "assigned")
        self.assertEqual(sol.qty_delivered, 0)
        sale_order.picking_ids.button_validate()
        self.assertEqual(so_picking.state, "done")
        self.assertEqual(sol.qty_delivered, 1)

    def test_settle_delivered_sale_order(self):
        """The ordered quantity is settled even if it was already delivered."""
        self.env["stock.quant"]._update_available_quantity(
            self.product, self.warehouse.lot_stock_id, 1
        )
        order_form = Form(self.env["sale.order"])
        order_form.partner_id = self.customer
        order_form.client_order_ref = "test_pos_sale_picking_keep"
        with order_form.order_line.new() as line_form:
            line_form.product_id = self.product
        sale_order = order_form.save()
        sale_order.action_confirm()
        sale_order.picking_ids.move_ids.write({"picked": True})
        sale_order.picking_ids.button_validate()
        sol = sale_order.order_line
        self.assertEqual(sol.qty_delivered, 1)
        self.main_pos_config.open_ui()
        # The tour checks that the line is loaded with quantity 1.00
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "PosSalePickingKeep1",
            login="accountman",
        )
        pos_order = sol.pos_order_line_ids.order_id
        self.assertEqual(pos_order.state, "paid")
        self.assertFalse(pos_order.picking_ids)
        self.assertEqual(sale_order.picking_ids.state, "done")

    def test_read_converted_price_uom_rounding(self):
        """Charge the exact sale order amount when the quantity converted to
        the product UoM is not representable with the Product Unit precision.

        4 Units of a pack-of-150 product = 0.02666 packs, which the PoS
        rounds to 0.03. The price returned by read_converted must be
        compensated so the PoS charges the sale order amount.
        """
        unit_uom = self.env.ref("uom.product_uom_unit")
        pack_uom = self.env["uom.uom"].create(
            {
                "name": "Pack of 150",
                "relative_factor": 150,
                "relative_uom_id": unit_uom.id,
            }
        )
        product = self.env["product.product"].create(
            {
                "name": "Test pack product",
                "available_in_pos": True,
                "is_storable": True,
                "uom_id": pack_uom.id,
                "lst_price": 984.0,
            }
        )
        sale_order = self.env["sale.order"].create(
            {
                "partner_id": self.customer.id,
                "order_line": [
                    Command.create(
                        {
                            "product_id": product.id,
                            "product_uom_id": unit_uom.id,
                            "product_uom_qty": 4,
                            "price_unit": 6.56,
                        }
                    )
                ],
            }
        )
        sale_order.action_confirm()
        sol = sale_order.order_line
        converted = sol.read_converted()[0]
        # What the PoS will charge: rounded qty * converted price
        qty_pos = pack_uom.round(
            converted["product_uom_qty"] - converted["qty_invoiced"]
        )
        self.assertAlmostEqual(qty_pos, 0.03)
        self.assertAlmostEqual(
            qty_pos * converted["price_unit"], sol.price_subtotal, places=2
        )

    def test_pos_order_flow(self):
        self.main_pos_config.open_ui()
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "PosSalePickingKeep2",
            login="accountman",
        )
        self.main_pos_config.current_session_id.close_session_from_ui()
        pos_order = self.env["pos.order"].search([], order="id desc", limit=1)
        self.assertTrue(pos_order)
        self.assertEqual(pos_order.state, "done")
        self.assertFalse(pos_order.session_id.picking_ids)
