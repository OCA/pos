from odoo.tests.common import TransactionCase


class TestProductQuickInfo(TransactionCase):
    """Test suite for product quick info features in POS.

    This test ensures:
    - Variant grouping is correctly generated
    - Warehouse data structure is returned
    - POS integration behaves correctly depending on configuration
    """

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Product = cls.env["product.product"]
        cls.Attribute = cls.env["product.attribute"]
        cls.AttributeValue = cls.env["product.attribute.value"]
        cls.PosConfig = cls.env["pos.config"]
        # ----------------------------
        # Create attribute and value
        # ----------------------------
        cls.attribute = cls.Attribute.create(
            {
                "name": "Color",
            }
        )
        cls.value_red = cls.AttributeValue.create(
            {
                "name": "Red",
                "attribute_id": cls.attribute.id,
            }
        )
        # ----------------------------
        # Create product with attribute
        # ----------------------------
        cls.product = cls.Product.create(
            {
                "name": "Test Product",
                "attribute_line_ids": [
                    (
                        0,
                        0,
                        {
                            "attribute_id": cls.attribute.id,
                            "value_ids": [(6, 0, [cls.value_red.id])],
                        },
                    )
                ],
            }
        )
        # ----------------------------
        # Create POS configuration
        # ----------------------------
        cls.pos_config = cls.PosConfig.create(
            {
                "name": "Test POS",
                "display_product_locations": True,
            }
        )

    # ----------------------------------------
    # VARIANT LIST
    # ----------------------------------------
    def test_get_variant_list(self):
        """Ensure variant list is generated with expected structure."""
        result = self.product._get_variant_list()
        self.assertTrue(result, "Variant list should not be empty")
        first_attr = result[0]
        self.assertEqual(first_attr["name"], "Color")
        self.assertIn("values", first_attr)
        first_value = first_attr["values"][0]
        self.assertEqual(first_value["name"], "Red")
        self.assertIn("search", first_value)

    # ----------------------------------------
    # WAREHOUSE LIST
    # ----------------------------------------
    def test_get_warehouse_list(self):
        """Ensure warehouse list is returned with expected structure."""
        result = self.product._get_warehouse_list()
        self.assertIsInstance(result, list)
        if result:
            warehouse = result[0]
            self.assertIn("name", warehouse)
            self.assertIn("available_quantity", warehouse)
            self.assertIn("forecasted_quantity", warehouse)
            self.assertIn("uom", warehouse)

    # ----------------------------------------
    # POS MAIN METHOD
    # ----------------------------------------
    def test_get_product_info_pos(self):
        """Ensure POS product info includes variants and warehouses."""
        result = self.product.get_product_info_pos(
            price=10,
            quantity=1,
            pos_config_id=self.pos_config.id,
        )
        self.assertIn("variants", result)
        self.assertIn("warehouses", result)

    # ----------------------------------------
    # CONFIG DISABLED CASE
    # ----------------------------------------
    def test_get_product_info_pos_without_locations(self):
        """Ensure method behaves correctly when locations display is disabled.
        Note:
        'warehouses' key is still present because it is provided by
        the base Odoo implementation (super call).
        """
        self.pos_config.display_product_locations = False
        result = self.product.get_product_info_pos(
            price=10,
            quantity=1,
            pos_config_id=self.pos_config.id,
        )
        self.assertIn("variants", result)
        # Important: warehouses comes from core Odoo, not from this module
        self.assertIn("warehouses", result)
