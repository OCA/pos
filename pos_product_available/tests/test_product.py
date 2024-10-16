from odoo.tests.common import TransactionCase


class TestProductTemplate(TransactionCase):
    def setUp(self):
        super(TestProductTemplate, self).setUp()

        # Create a test product template
        self.product_template = self.env["product.template"].create(
            {
                "name": "Test Product",
            }
        )

        # Create test POS configurations
        self.pos_config_1 = self.env["pos.config"].create(
            {
                "name": "POS Config 1",
            }
        )
        self.pos_config_2 = self.env["pos.config"].create(
            {
                "name": "POS Config 2",
            }
        )

    def test_pos_center_ids_field_exists(self):
        """Test the pos_center_ids field exists in the product.template model."""
        self.assertIn("pos_center_ids", self.product_template._fields)

    def test_pos_center_ids_field_empty_by_default(self):
        """Test the pos_center_ids field is empty by default."""
        self.assertFalse(self.product_template.pos_center_ids)

    def test_pos_center_ids_field_can_be_set(self):
        """Test the pos_center_ids field can be set."""
        self.product_template.pos_center_ids = [
            (6, 0, [self.pos_config_1.id, self.pos_config_2.id])
        ]
        self.assertEqual(
            self.product_template.pos_center_ids, self.pos_config_1 | self.pos_config_2
        )
