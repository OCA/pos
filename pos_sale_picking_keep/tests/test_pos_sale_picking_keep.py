# Copyright 2026 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo.tests import Form

from .common import PosSalePickingKeepCommon


class TestPosSalePickingKeep(PosSalePickingKeepCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env.company.point_of_sale_update_stock_quantities = "closing"

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
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
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

    def test_pos_order_flow(self):
        self.main_pos_config.open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "PosSalePickingKeep2",
            login="accountman",
        )
        self.main_pos_config.current_session_id.close_session_from_ui()
        pos_order = self.env["pos.order"].search([], order="id desc", limit=1)
        self.assertTrue(pos_order)
        self.assertEqual(pos_order.state, "done")
        self.assertFalse(pos_order.session_id.picking_ids)
