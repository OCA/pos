# Copyright 2026 Miguel Machado
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import odoo.tests

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosSequence(TestPoSCommon):
    def test_product_template_pos_sequence_default(self):
        template = self.env["product.template"].create(
            {
                "name": "POS sequence default test",
                "list_price": 10.0,
                "available_in_pos": True,
            }
        )
        self.assertEqual(template.pos_sequence, 100)

    def test_product_variant_related_pos_sequence(self):
        template = self.env["product.template"].create(
            {
                "name": "POS sequence related test",
                "list_price": 10.0,
                "available_in_pos": True,
                "pos_sequence": 5,
            }
        )
        variant = template.product_variant_id
        self.assertEqual(variant.pos_sequence, 5)

        variant.pos_sequence = 99
        self.assertEqual(template.pos_sequence, 99)

    def test_product_product_load_pos_data_fields_includes_pos_sequence(self):
        fields_list = self.env["product.product"]._load_pos_data_fields(
            self.basic_config.id
        )
        self.assertIn("pos_sequence", fields_list)
