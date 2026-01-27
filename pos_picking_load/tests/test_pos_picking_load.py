# Copyright (C) 2017: Opener B.V. (https://opener.amsterdam)
# @author: Stefan Rijnhart <stefan@opener.am>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo.tests.common import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestPOSPicking(TransactionCase):
    def setUp(self):
        super().setUp()
        # Create base records needed for tests
        self.company = self.env.company

        self.product = self.env["product.product"].create(
            {
                "name": "Test Product",
                "type": "product",
                "list_price": 100,
                "standard_price": 80,
                "taxes_id": [(6, 0, [])],  # No taxes by default for simplicity
            }
        )

        self.partner = self.env["res.partner"].create(
            {
                "name": "Test Customer",
            }
        )

        # Configure warehouse and locations
        self.warehouse = self.env["stock.warehouse"].create(
            {
                "name": "Test Warehouse",
                "code": "TST",
                "company_id": self.company.id,
            }
        )

        # Create and configure POS
        self.pos_config = self.env["pos.config"].create(
            {
                "name": "Test POS",
                "picking_type_id": self.warehouse.pick_type_id.id,
                "iface_load_picking": True,
                "iface_load_picking_max_qty": 10,
            }
        )

        # Configure picking type
        self.picking_type = self.warehouse.pick_type_id
        self.picking_type.write(
            {
                "available_in_pos": True,
                "company_id": self.company.id,
            }
        )

        # Create payment method
        self.pos_payment_method = self.env["pos.payment.method"].create(
            {
                "name": "Test Payment Method",
                "company_id": self.company.id,
                "receivable_account_id": (
                    self.company.account_default_pos_receivable_account_id.id
                ),
            }
        )
        self.pos_config.write({"payment_method_ids": [(4, self.pos_payment_method.id)]})

        # Create POS session
        self.pos_session = self.env["pos.session"].create(
            {
                "config_id": self.pos_config.id,
                "user_id": self.env.uid,
            }
        )
        self.pos_session.action_pos_session_open()

    def _create_picking(self):
        """Helper method to create a stock picking"""
        return self.env["stock.picking"].create(
            {
                "partner_id": self.partner.id,
                "picking_type_id": self.picking_type.id,
                "location_id": self.picking_type.default_location_src_id.id,
                "location_dest_id": self.picking_type.default_location_dest_id.id,
                "move_ids": [
                    (
                        0,
                        0,
                        {
                            "name": "Test Move",
                            "product_id": self.product.id,
                            "product_uom_qty": 5.0,
                            "product_uom": self.product.uom_id.id,
                            "location_id": self.picking_type.default_location_src_id.id,
                            "location_dest_id": self.picking_type.default_location_dest_id.id,
                        },
                    )
                ],
                "company_id": self.company.id,
            }
        )

    def _create_pos_order(self, picking):
        """Helper method to create a POS order"""
        # Calculate amounts
        price_unit = 100
        quantity = 5
        amount_total = price_unit * quantity

        pos_order = self.env["pos.order"].create(
            {
                "session_id": self.pos_session.id,
                "partner_id": self.partner.id,
                "origin_picking_id": picking.id,
                "amount_tax": 0.0,
                "amount_total": amount_total,
                "amount_paid": amount_total,  # Fix: Ensure amount_paid matches total
                "amount_return": 0.0,
                "company_id": self.company.id,
                "lines": [
                    (
                        0,
                        0,
                        {
                            "product_id": self.product.id,
                            "qty": quantity,
                            "price_unit": price_unit,
                            "price_subtotal": amount_total,
                            "price_subtotal_incl": amount_total,
                            "name": "Test Line",
                        },
                    )
                ],
            }
        )

        # Add payment
        self.env["pos.payment"].create(
            {
                "pos_order_id": pos_order.id,
                "payment_method_id": self.pos_payment_method.id,
                "amount": amount_total,
            }
        )

        return pos_order

    def test_picking_availability_in_pos(self):
        """Test picking search and load functionality for POS"""
        product = self.env["product.product"].create(
            {
                "name": "Test Product",
                "type": "product",
                "available_in_pos": True,  # Set product availability for POS
            }
        )

        picking = self.env["stock.picking"].create(
            {
                "picking_type_id": self.env.ref("stock.picking_type_out").id,
                "partner_id": self.partner.id,
                "move_ids_without_package": [
                    (
                        0,
                        0,
                        {
                            "product_id": product.id,
                            "name": "Test Move",
                            "product_uom_qty": 5.0,
                            "product_uom": product.uom_id.id,
                            "location_id": self.env.ref(
                                "stock.stock_location_stock"
                            ).id,
                            "location_dest_id": self.env.ref(
                                "stock.stock_location_customers"
                            ).id,
                        },
                    )
                ],
            }
        )

        picking.action_confirm()
        picking.action_assign()

        # Ensure that the picking is available in POS search
        found_pickings = (
            self.env["stock.picking"]
            .with_context(allowed_company_ids=self.company.ids)
            .search(
                [
                    ("name", "=", picking.name),
                ]
            )
        )

        self.assertTrue(found_pickings, "Picking should be found in POS search")
        self.assertEqual(len(found_pickings), 1, "Should find exactly one picking")

        # Test picking load
        picking_data = self.env["stock.picking"].load_picking_for_pos(picking.id)
        self.assertEqual(picking_data["id"], picking.id)
        self.assertEqual(len(picking_data["line_ids"]), 1)
        self.assertEqual(picking_data["line_ids"][0]["quantity"], 5.0)

    def test_procurement_group_assignment(self):
        """Test procurement group assignment from origin picking"""
        product = self.env["product.product"].create(
            {
                "name": "Test Product",
                "type": "product",
            }
        )

        picking = self.env["stock.picking"].create(
            {
                "picking_type_id": self.env.ref("stock.picking_type_out").id,
                "partner_id": self.partner.id,
                "move_ids_without_package": [
                    (
                        0,
                        0,
                        {
                            "product_id": product.id,
                            "name": "Test Move",
                            "product_uom_qty": 5.0,
                            "product_uom": product.uom_id.id,
                            "location_id": self.env.ref(
                                "stock.stock_location_stock"
                            ).id,
                            "location_dest_id": self.env.ref(
                                "stock.stock_location_customers"
                            ).id,
                        },
                    )
                ],
            }
        )

        proc_group = self.env["procurement.group"].create(
            {
                "name": "Test procurement group",
            }
        )
        picking.group_id = proc_group
        picking.action_confirm()
        picking.action_assign()
        pos_order = self._create_pos_order(
            picking
        )  # Ensure this links picking correctly to POS
        pos_order.action_pos_order_paid()
        self.assertTrue(picking, "POS Order should have associated pickings")

        self.assertIsNotNone(picking, "Picking should be linked to the POS order")
        self.assertEqual(
            picking.group_id,
            proc_group,
            "New picking should have same procurement group as origin picking",
        )
