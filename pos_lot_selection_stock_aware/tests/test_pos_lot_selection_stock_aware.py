# Copyright 2025 Nathan Kirui
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests.common import TransactionCase


class TestPosLotSelectionStockAware(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))

        # Create a product with lot tracking
        cls.product = cls.env["product.product"].create(
            {
                "name": "Test Product with Lots",
                "type": "product",
                "tracking": "lot",
            }
        )

        # Create test lots
        cls.lot1 = cls.env["stock.lot"].create(
            {
                "name": "LOT001",
                "product_id": cls.product.id,
                "company_id": cls.env.company.id,
            }
        )
        cls.lot2 = cls.env["stock.lot"].create(
            {
                "name": "LOT002",
                "product_id": cls.product.id,
                "company_id": cls.env.company.id,
            }
        )

        # Create stock location
        cls.location = cls.env.ref("stock.stock_location_stock")

        # Add stock quantities
        cls.env["stock.quant"].create(
            {
                "product_id": cls.product.id,
                "location_id": cls.location.id,
                "lot_id": cls.lot1.id,
                "quantity": 10.0,
            }
        )
        cls.env["stock.quant"].create(
            {
                "product_id": cls.product.id,
                "location_id": cls.location.id,
                "lot_id": cls.lot2.id,
                "quantity": 5.0,
            }
        )

    def test_get_available_lots_for_pos(self):
        """Test that get_available_lots_for_pos returns correct lots"""
        lots = self.product.get_available_lots_for_pos(
            self.env.company.id, self.location.id
        )

        # Should return both lots with quantities
        self.assertEqual(len(lots), 2)

        # Check lot names and quantities
        lot_names = {lot["name"] for lot in lots}
        self.assertIn("LOT001", lot_names)
        self.assertIn("LOT002", lot_names)

        # Check quantities
        for lot in lots:
            if lot["name"] == "LOT001":
                self.assertEqual(lot["quantity"], 10.0)
            elif lot["name"] == "LOT002":
                self.assertEqual(lot["quantity"], 5.0)

    def test_filter_zero_quantity_lots(self):
        """Test that lots with zero quantity are filtered out"""
        # Create a lot with zero quantity (not used directly, just for filtering)
        self.env["stock.lot"].create(
            {
                "name": "LOT_ZERO",
                "product_id": self.product.id,
                "company_id": self.env.company.id,
            }
        )

        lots = self.product.get_available_lots_for_pos(
            self.env.company.id, self.location.id
        )

        # Should not include the zero-quantity lot
        lot_names = {lot["name"] for lot in lots}
        self.assertNotIn("LOT_ZERO", lot_names)

    def test_lot_pos_info_with_location(self):
        """Test _get_pos_info returns quantity for specific location"""
        lot_info = self.lot1._get_pos_info(self.location.id)

        self.assertEqual(lot_info["id"], self.lot1.id)
        self.assertEqual(lot_info["name"], "LOT001")
        self.assertEqual(lot_info["quantity"], 10.0)

    def test_product_without_tracking(self):
        """Test that products without tracking return empty list"""
        product_no_tracking = self.env["product.product"].create(
            {
                "name": "Product No Tracking",
                "type": "product",
                "tracking": "none",
            }
        )

        lots = product_no_tracking.get_available_lots_for_pos(
            self.env.company.id, self.location.id
        )

        self.assertEqual(lots, [])
