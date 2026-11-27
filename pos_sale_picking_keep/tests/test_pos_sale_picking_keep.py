# Copyright 2026 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo.tests import Form, tagged

from .common import PosSalePickingKeepCommon


@tagged("post_install", "-at_install")
class TestPosSalePickingKeep(PosSalePickingKeepCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        main_company = cls._get_main_company()
        main_company.point_of_sale_update_stock_quantities = "closing"
        cls.stock_location = cls.warehouse.lot_stock_id

    def _update_stock_quantity(self, lot, qty):
        self.env["stock.quant"]._update_available_quantity(
            lot.product_id, self.stock_location, lot_id=lot, quantity=qty
        )

    def test_01_sale_order_pos_order_done(self):
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
        self.main_pos_config.with_user(self.user_accountman).open_ui()
        self.start_pos_tour("PosSalePickingKeep1", login="accountman")
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
        res = pos_order.refund()
        refund_pos_order = self.env[res["res_model"]].browse(res["res_id"])
        self.assertEqual(refund_pos_order.state, "draft")
        wizard_form = Form(
            self.env["pos.make.payment"].with_context(active_id=refund_pos_order.id)
        )
        wizard = wizard_form.save()
        wizard.check()
        self.assertEqual(refund_pos_order.state, "paid")
        refund_picking = refund_pos_order.picking_ids
        self.assertTrue(refund_picking)
        self.assertEqual(refund_picking.state, "done")
        self.assertEqual(len(sale_order.picking_ids), 2)
        self.assertIn(refund_picking, sale_order.picking_ids)
        self.assertNotEqual(
            refund_picking.picking_type_id, refund_pos_order.config_id.picking_type_id
        )
        self.assertEqual(len(refund_picking.move_ids), 1)
        self.assertEqual(len(sol.move_ids), 2)
        self.assertEqual(sol.qty_delivered, 0)

    def test_01_sale_order_pos_order_done_multi_lot(self):
        self.product.tracking = "serial"
        order_form = Form(self.env["sale.order"])
        order_form.partner_id = self.customer
        order_form.client_order_ref = "test_pos_sale_picking_keep"
        with order_form.order_line.new() as line_form:
            line_form.product_id = self.product
        with order_form.order_line.new() as line_form:
            line_form.product_id = self.product
        sale_order = order_form.save()
        lot_1 = self.env["stock.lot"].create(
            {
                "name": "1001",
                "product_id": self.product.id,
            }
        )
        lot_2 = self.env["stock.lot"].create(
            {
                "name": "1002",
                "product_id": self.product.id,
            }
        )
        self._update_stock_quantity(lot_1, 1)
        self._update_stock_quantity(lot_2, 1)
        sol_1 = sale_order.order_line[0]
        sol_2 = sale_order.order_line[1]
        self.main_pos_config.with_user(self.user_accountman).open_ui()
        self.start_pos_tour("PosSalePickingKeep1MultiLots", login="accountman")
        self.assertEqual(sale_order.state, "sale")
        self.assertEqual(len(sale_order.picking_ids), 1)
        pos_order = sol_1.pos_order_line_ids.order_id
        self.assertEqual(pos_order.state, "paid")
        self.assertFalse(pos_order.picking_ids)
        so_picking = sale_order.picking_ids
        self.assertEqual(so_picking.state, "assigned")
        self.assertEqual(sol_1.qty_delivered, 0)
        self.assertEqual(sol_2.qty_delivered, 0)
        sale_order.picking_ids.button_validate()
        self.assertEqual(so_picking.state, "done")
        self.assertEqual(sol_1.qty_delivered, 1)
        self.assertEqual(sol_2.qty_delivered, 1)
        sol_1_moves = sol_1.move_ids
        sol_2_moves = sol_2.move_ids
        res = pos_order.refund()
        refund_pos_order = self.env[res["res_model"]].browse(res["res_id"])
        self.assertEqual(refund_pos_order.state, "draft")
        wizard_form = Form(
            self.env["pos.make.payment"].with_context(active_id=refund_pos_order.id)
        )
        wizard = wizard_form.save()
        wizard.check()
        self.assertEqual(refund_pos_order.state, "paid")
        refund_picking = refund_pos_order.picking_ids
        self.assertTrue(refund_picking)
        self.assertEqual(refund_picking.state, "done")
        self.assertEqual(len(sale_order.picking_ids), 2)
        self.assertIn(refund_picking, sale_order.picking_ids)
        self.assertNotEqual(
            refund_picking.picking_type_id, refund_pos_order.config_id.picking_type_id
        )
        self.assertEqual(len(refund_picking.move_ids), 2)
        self.assertEqual(len(sol_1.move_ids), 2)
        sol_1_move_extra = sol_1.move_ids - sol_1_moves
        self.assertEqual(lot_1, sol_1_move_extra.lot_ids)
        self.assertEqual(len(sol_2.move_ids), 2)
        sol_2_move_extra = sol_2.move_ids - sol_2_moves
        self.assertEqual(lot_2, sol_2_move_extra.lot_ids)
        self.assertEqual(sol_1.qty_delivered, 0)
        self.assertEqual(sol_2.qty_delivered, 0)

    def test_01_sale_order_pos_order_done_multi_lot_not_full_delivery(self):
        self.product.tracking = "serial"
        order_form = Form(self.env["sale.order"])
        order_form.partner_id = self.customer
        order_form.client_order_ref = "test_pos_sale_picking_keep"
        with order_form.order_line.new() as line_form:
            line_form.product_id = self.product
        with order_form.order_line.new() as line_form:
            line_form.product_id = self.product
        sale_order = order_form.save()
        lot_1 = self.env["stock.lot"].create(
            {
                "name": "1001",
                "product_id": self.product.id,
            }
        )
        self._update_stock_quantity(lot_1, 1)
        sol_1 = sale_order.order_line[0]
        sol_2 = sale_order.order_line[1]
        self.main_pos_config.with_user(self.user_accountman).open_ui()
        self.start_pos_tour("PosSalePickingKeep1MultiLots", login="accountman")
        self.assertEqual(sale_order.state, "sale")
        self.assertEqual(len(sale_order.picking_ids), 1)
        pos_order = sol_1.pos_order_line_ids.order_id
        self.assertEqual(pos_order.state, "paid")
        self.assertFalse(pos_order.picking_ids)
        so_picking = sale_order.picking_ids
        self.assertEqual(so_picking.state, "assigned")
        sol_1_moves = sol_1.move_ids
        sol_2_moves = sol_2.move_ids
        sol_1_moves.quantity = 1
        sol_2_moves.quantity = 0
        res = so_picking.button_validate()
        wizard = self.env[res["res_model"]].with_context(**res["context"]).create({})
        wizard.process_cancel_backorder()
        self.assertEqual(so_picking.state, "done")
        self.assertEqual(sol_1.qty_delivered, 1)
        self.assertEqual(sol_2.qty_delivered, 0)
        res = pos_order.refund()
        refund_pos_order = self.env[res["res_model"]].browse(res["res_id"])
        self.assertEqual(refund_pos_order.state, "draft")
        wizard_form = Form(
            self.env["pos.make.payment"].with_context(active_id=refund_pos_order.id)
        )
        wizard = wizard_form.save()
        wizard.check()
        self.assertEqual(refund_pos_order.state, "paid")
        refund_picking = refund_pos_order.picking_ids
        self.assertTrue(refund_picking)
        self.assertEqual(refund_picking.state, "done")
        self.assertEqual(len(sale_order.picking_ids), 2)
        self.assertIn(refund_picking, sale_order.picking_ids)
        self.assertNotEqual(
            refund_picking.picking_type_id, refund_pos_order.config_id.picking_type_id
        )
        self.assertEqual(len(refund_picking.move_ids), 1)
        self.assertEqual(len(sol_1.move_ids), 2)
        sol_1_move_extra = sol_1.move_ids - sol_1_moves
        self.assertEqual(lot_1, sol_1_move_extra.lot_ids)
        self.assertEqual(len(sol_2.move_ids), 1)
        self.assertEqual(sol_1.qty_delivered, 0)
        self.assertEqual(sol_2.qty_delivered, 0)

    def test_02_pos_order_flow(self):
        self.main_pos_config.with_user(self.user_accountman).open_ui()
        self.start_pos_tour("PosSalePickingKeep2", login="accountman")
        self.main_pos_config.with_user(
            self.user_accountman
        ).current_session_id.close_session_from_ui()
        pos_order = self.env["pos.order"].search([], order="id desc", limit=1)
        self.assertTrue(pos_order)
        self.assertEqual(pos_order.state, "done")
        self.assertFalse(pos_order.session_id.picking_ids)
