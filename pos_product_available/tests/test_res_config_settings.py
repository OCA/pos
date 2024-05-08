from odoo.tests.common import TransactionCase
from odoo.exceptions import ValidationError


class TestPosConfig(TransactionCase):
    def setUp(self):
        super(TestPosConfig, self).setUp()
        self.PosConfig = self.env["pos.config"]
        self.ResConfigSettings = self.env["res.config.settings"]
        self.ProductTemplate = self.env["product.template"]

        # Create test products
        self.product1 = self.ProductTemplate.create({"name": "Product 1"})
        self.product2 = self.ProductTemplate.create({"name": "Product 2"})

        # Create a test pos.config record
        self.pos_config = self.PosConfig.create(
            {
                "name": "Test POS",
                "available_product": True,
                "available_product_ids": [(6, 0, [self.product1.id, self.product2.id])]
            }
        )

    def test_pos_config_creation(self):
        self.assertEqual(self.pos_config.name, "Test POS")
        self.assertEqual(self.pos_config.available_product, True)
        self.assertEqual(
            self.pos_config.available_product_ids, self.product1 | self.product2
        )

    def test_res_config_settings_computation(self):
        # Create a test res.config.settings record
        res_config = self.ResConfigSettings.create(
            {"pos_config_id": self.pos_config.id, "pos_available_product": True}
        )

        # Check the computation of pos_available_product_ids field
        self.assertEqual(
            res_config.pos_available_product_ids, self.product1 | self.product2
        )

        # Check the computation when pos_available_product is False
        res_config.pos_available_product = False
        self.assertFalse(res_config.pos_available_product_ids)
