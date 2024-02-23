# Copyright 2016 Sergio Teruel <sergio.teruel@tecnativa.com>
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo.tests.common import TransactionCase


class TestProductVariantPrice(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.template = cls.env["product.template"]
        cls.product_product = cls.env["product.product"]
        cls.attribute = cls.env["product.attribute"]
        cls.attribute_value = cls.env["product.attribute.value"]

        cls.att_color = cls.attribute.create({"name": "color_test"})

        cls.att_color_blue = cls.attribute_value.create(
            {"name": "Blue", "attribute_id": cls.att_color.id}
        )
        cls.att_color_red = cls.attribute_value.create(
            {"name": "Red", "attribute_id": cls.att_color.id}
        )

        cls.product_template = cls.template.create(
            {
                "name": "Product Template",
                "list_price": 1500.00,
                "attribute_line_ids": [
                    (
                        0,
                        0,
                        {
                            "attribute_id": cls.att_color.id,
                            "value_ids": [
                                (6, 0, (cls.att_color_blue + cls.att_color_red).ids)
                            ],
                        },
                    )
                ],
                "available_in_pos": True,
            }
        )

        cls.product_blue = cls.product_template.product_variant_ids.filtered(
            lambda x: x.product_template_attribute_value_ids.product_attribute_value_id
            == cls.att_color_blue
        )
        cls.product_red = cls.product_template.product_variant_ids.filtered(
            lambda x: x.product_template_attribute_value_ids.product_attribute_value_id
            == cls.att_color_red
        )

    def test_post_init_hook(self):
        from ..hooks import set_pos_availability_on_variant

        set_pos_availability_on_variant(self.cr, None)
        self.product_template.product_variant_ids.invalidate_recordset()
        self.product_template.invalidate_recordset()
        self.assertEqual(
            self.product_template.available_in_pos, self.product_blue.available_in_pos
        )
        self.assertEqual(
            self.product_template.available_in_pos, self.product_red.available_in_pos
        )

    def test_create_product_template(self):
        self.assertEqual(
            self.product_template.available_in_pos,
            self.product_template.product_variant_ids[:1].available_in_pos,
        )

    def test_create_variant(self):
        new_variant = self.product_product.create(
            {"product_tmpl_id": self.product_template.id}
        )
        self.assertEqual(
            self.product_template.available_in_pos, new_variant.available_in_pos
        )
        other_variant = self.product_product.create(
            {"product_tmpl_id": self.product_template.id, "available_in_pos": False}
        )
        self.assertNotEqual(
            self.product_template.available_in_pos, other_variant.available_in_pos
        )

    def test_update_variant(self):
        self.product_blue.available_in_pos = False
        self.assertNotEqual(
            self.product_blue.available_in_pos,
            self.product_blue.product_tmpl_id.available_in_pos,
        )
        self.assertNotEqual(
            self.product_blue.available_in_pos, self.product_red.available_in_pos
        )

    def test_update_template_variant(self):
        self.assertTrue(self.product_template.available_in_pos)
        self.assertTrue(self.product_blue.available_in_pos)
        self.assertTrue(self.product_red.available_in_pos)
        self.product_template.available_in_pos = False
        self.assertFalse(self.product_blue.available_in_pos)
        self.assertFalse(self.product_red.available_in_pos)
