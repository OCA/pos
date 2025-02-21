# Copyright 2023 FactorLibre - Juan Carlos Bonilla

import odoo

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosDisplayDefaultCode(TestPoSCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)
        cls.config = cls.basic_config
        cls.config.display_default_code = True
        cls.pos_session = cls.env["pos.session"].create({"config_id": cls.config.id})

    def test_load_params_products(self):
        result = self.pos_session._loader_params_product_product()
        self.assertTrue(result["context"]["display_default_code"])
