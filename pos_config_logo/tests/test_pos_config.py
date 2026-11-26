# Copyright 2026 Miguel Machado
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@tagged("post_install", "-at_install")
class TestPosConfigLogo(TestPoSCommon):
    def test_load_pos_data_fields_includes_logo(self):
        fields = self.env["pos.config"]._load_pos_data_fields(self.basic_config.id)
        self.assertIn("logo", fields)
