# Copyright 2026 INVITU (<https://www.invitu.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)

import odoo.tests

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon

# 1x1 transparent PNG, only used to check the <img> tag gets a real src.
ONE_PIXEL_PNG = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk"
    "+A8AAQUBAScY42YAAAAASUVORK5CYII="
)


@odoo.tests.tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    def test_show_product_image_in_configurator(self):
        attribute = self.env["product.attribute"].create(
            {
                "name": "Test Color",
                "create_variant": "no_variant",
            }
        )
        attribute_values = self.env["product.attribute.value"].create(
            [
                {
                    "name": "Test Red",
                    "attribute_id": attribute.id,
                },
                {
                    "name": "Test Blue",
                    "attribute_id": attribute.id,
                },
            ]
        )
        product = self.env["product.product"].create(
            {
                "name": "Test Configurable Product",
                "available_in_pos": True,
                "list_price": 10,
                "taxes_id": False,
                "image_variant_1920": ONE_PIXEL_PNG,
            }
        )
        self.env["product.template.attribute.line"].create(
            {
                "product_tmpl_id": product.product_tmpl_id.id,
                "attribute_id": attribute.id,
                "value_ids": [(6, 0, attribute_values.ids)],
            }
        )
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "PosShowVariantImageTour",
            login="pos_user",
        )
