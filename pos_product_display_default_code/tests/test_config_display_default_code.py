# Copyright 2023 FactorLibre - Juan Carlos Bonilla

import odoo

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosDisplayDefaultCode(TestPoSCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.config = cls.basic_config
        cls.config.display_default_code = True

    def test_config_display_default_code(self):
        product = self.env["product.product"].create(
            {
                "name": "Test sofa",
                "default_code": "CHAIR_01",
            }
        )

        product_result = self.env["product.product"]._load_pos_data_read(
            product, self.config
        )
        template_result = self.env["product.template"]._load_pos_data_read(
            product.product_tmpl_id, self.config
        )
        config_result = self.env["pos.config"]._load_pos_data_read(
            self.config, self.config
        )

        expected_name = "[CHAIR_01] Test sofa"
        self.assertEqual(product_result[0]["display_name"], expected_name)
        self.assertEqual(template_result[0]["display_name"], expected_name)
        self.assertTrue(config_result[0]["display_default_code"])
