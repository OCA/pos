# FILEPATH: /media/odoo16/practice_addons/pos_product_available/tests/test_pos_session.py

from odoo.tests.common import TransactionCase


class TestPosSession(TransactionCase):
    def setUp(self):
        super(TestPosSession, self).setUp()

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
                "available_product": True,
                "available_product_ids": [(6, 0, [self.product_template.id])]
            }
        )

        # Create a test POS session
        self.pos_session = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_1.id,
            }
        )

    def test__loader_params_product_product_with_available_product(self):
        """Test the _loader_params_product_product method when available_product is True."""
        result = self.pos_session._loader_params_product_product()

        # Check if the domain is set correctly
        self.assertIn(
            ("product_tmpl_id", "in", self.pos_config_1.available_product_ids.ids),
            result["search_params"]["domain"]
        )

    def test__loader_params_product_product_without_available_product(self):
        """Test the _loader_params_product_product method when available_product is False."""
        # Set available_product to False
        self.pos_config_1.available_product = False

        result = self.pos_session._loader_params_product_product()

        # Check if the domain is not modified
        self.assertNotIn(
            ("product_tmpl_id", "in", self.pos_config_1.available_product_ids.ids),
            result["search_params"]["domain"]
        )
