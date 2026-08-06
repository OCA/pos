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
        cls.product_test = cls.env["product.product"].create(
            {
                "name": "Test sofa",
                "available_in_pos": True,
                "default_code": "CHAIR_01",
            }
        )

    def test_config_display_default_code(self):
        result = self.config.display_default_code
        self.assertTrue(result)

    def test_product_load_pos_data_read_with_default_code(self):
        self.config.display_default_code = True
        res_product = self.env["product.product"]._load_pos_data_read(
            self.product_test, self.config
        )
        self.assertTrue(len(res_product) > 0)
        self.assertEqual(res_product[0]["display_name"], "[CHAIR_01] Test sofa")

        res_template = self.env["product.template"]._load_pos_data_read(
            self.product_test.product_tmpl_id, self.config
        )
        self.assertTrue(len(res_template) > 0)

    def test_product_load_pos_data_read_without_default_code(self):
        self.config.display_default_code = False
        res_product = self.env["product.product"]._load_pos_data_read(
            self.product_test, self.config
        )
        self.assertTrue(len(res_product) > 0)
        self.assertEqual(res_product[0]["display_name"], "Test sofa")

        res_template = self.env["product.template"]._load_pos_data_read(
            self.product_test.product_tmpl_id, self.config
        )
        self.assertTrue(len(res_template) > 0)

    def test_res_config_settings(self):
        res_config = (
            self.env["res.config.settings"]
            .with_context(default_pos_config_id=self.config.id)
            .create(
                {
                    "pos_display_default_code": True,
                }
            )
        )
        res_config.execute()
        self.assertTrue(self.config.display_default_code)
