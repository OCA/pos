# Copyright 2026 INVITU (<https://www.invitu.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosReceiptHideAttributeNoVariant(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cooking, side = cls.env["product.attribute"].create(
            [
                {
                    "name": "Cooking",
                    "create_variant": "no_variant",
                    "pos_hide_on_receipt": True,
                },
                {
                    "name": "Side",
                    "create_variant": "no_variant",
                    "pos_hide_on_kitchen_ticket": True,
                },
            ]
        )
        cooking_values = cls.env["product.attribute.value"].create(
            [
                {"name": "Rare", "attribute_id": cooking.id},
                {"name": "Medium", "attribute_id": cooking.id},
            ]
        )
        side_values = cls.env["product.attribute.value"].create(
            [
                {"name": "Fries", "attribute_id": side.id},
                {"name": "Beans", "attribute_id": side.id},
            ]
        )
        cls.env["product.template"].create(
            {
                "name": "Hide Steak",
                "type": "consu",
                "available_in_pos": True,
                "list_price": 20.0,
                "taxes_id": False,
                "attribute_line_ids": [
                    (
                        0,
                        0,
                        {
                            "attribute_id": cooking.id,
                            "value_ids": [(6, 0, cooking_values.ids)],
                        },
                    ),
                    (
                        0,
                        0,
                        {
                            "attribute_id": side.id,
                            "value_ids": [(6, 0, side_values.ids)],
                        },
                    ),
                ],
            }
        )

    def test_hide_no_variant_values(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "PosReceiptHideAttributeNoVariantTour",
            login="pos_user",
        )

    def test_hide_no_variant_values_cancelled_line(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "PosReceiptHideAttributeNoVariantCancelTour",
            login="pos_user",
        )
