from odoo.tests import TransactionCase


class TestPosOrderLineNoVariantCompute(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.PosOrderLine = cls.env["pos.order.line"]

        cls.attr_no_variant = cls.env["product.attribute"].create(
            {
                "name": "Engraving",
                "create_variant": "no_variant",
            }
        )
        cls.attr_always = cls.env["product.attribute"].create(
            {
                "name": "Color",
                "create_variant": "always",
            }
        )

        cls.value_no_variant_1 = cls.env["product.attribute.value"].create(
            {
                "name": "Front",
                "attribute_id": cls.attr_no_variant.id,
            }
        )
        cls.value_no_variant_2 = cls.env["product.attribute.value"].create(
            {
                "name": "Back",
                "attribute_id": cls.attr_no_variant.id,
            }
        )
        cls.value_always = cls.env["product.attribute.value"].create(
            {
                "name": "Red",
                "attribute_id": cls.attr_always.id,
            }
        )

        cls.template_main = cls.env["product.template"].create(
            {
                "name": "Custom Mug",
                "attribute_line_ids": [
                    (
                        0,
                        0,
                        {
                            "attribute_id": cls.attr_no_variant.id,
                            "value_ids": [
                                (
                                    6,
                                    0,
                                    [
                                        cls.value_no_variant_1.id,
                                        cls.value_no_variant_2.id,
                                    ],
                                )
                            ],
                        },
                    ),
                    (
                        0,
                        0,
                        {
                            "attribute_id": cls.attr_always.id,
                            "value_ids": [(6, 0, [cls.value_always.id])],
                        },
                    ),
                ],
            }
        )

        cls.template_other = cls.env["product.template"].create(
            {
                "name": "Sticker",
                "attribute_line_ids": [
                    (
                        0,
                        0,
                        {
                            "attribute_id": cls.attr_no_variant.id,
                            "value_ids": [(6, 0, [cls.value_no_variant_1.id])],
                        },
                    )
                ],
            }
        )

        cls.product_main = cls.template_main.product_variant_ids[:1]

        cls.main_no_variant_ptav = cls.template_main.attribute_line_ids.filtered(
            lambda line: line.attribute_id == cls.attr_no_variant
        ).product_template_value_ids[:1]
        cls.main_always_ptav = cls.template_main.attribute_line_ids.filtered(
            lambda line: line.attribute_id == cls.attr_always
        ).product_template_value_ids[:1]
        cls.other_no_variant_ptav = cls.template_other.attribute_line_ids.filtered(
            lambda line: line.attribute_id == cls.attr_no_variant
        ).product_template_value_ids[:1]

    def test_compute_keeps_only_no_variant_values_for_same_template(self):
        line = self.PosOrderLine.new(
            {
                "product_id": self.product_main.id,
            }
        )
        line.attribute_value_ids = (
            self.main_no_variant_ptav
            | self.main_always_ptav
            | self.other_no_variant_ptav
        )

        line._compute_no_variant_attribute_values()

        self.assertSetEqual(
            set(line.product_no_variant_attribute_value_ids._origin.ids),
            set(self.main_no_variant_ptav.ids),
            "Only no-variant values from the same template must be kept.",
        )

    def test_compute_returns_empty_when_product_is_missing(self):
        line = self.PosOrderLine.new({})
        line.attribute_value_ids = self.main_no_variant_ptav

        line._compute_no_variant_attribute_values()

        self.assertFalse(
            line.product_no_variant_attribute_value_ids,
            "Computed no-variant values must be empty when no product is set.",
        )
