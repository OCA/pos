# Copyright 2026 INVITU (<https://www.invitu.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosOrderLineChangeVariant(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        color_attribute = cls.env["product.attribute"].create(
            {"name": "Color", "create_variant": "always"}
        )
        color_red, color_blue = cls.env["product.attribute.value"].create(
            [
                {"name": "Red", "attribute_id": color_attribute.id, "sequence": 1},
                {"name": "Blue", "attribute_id": color_attribute.id, "sequence": 2},
            ]
        )

        cls.configurable_product = cls.env["product.template"].create(
            {
                "name": "Change Variant Shirt",
                "type": "consu",
                "available_in_pos": True,
                "list_price": 20.0,
                "taxes_id": False,
                "attribute_line_ids": [
                    (
                        0,
                        0,
                        {
                            "attribute_id": color_attribute.id,
                            "value_ids": [(6, 0, [color_red.id, color_blue.id])],
                        },
                    )
                ],
            }
        )

    def test_change_orderline_variant(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "PosOrderLineChangeVariantTour",
            login="pos_user",
        )
