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
        result = self.config.display_default_code
        self.assertTrue(result)
