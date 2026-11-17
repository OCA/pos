import odoo

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestProductProduct(TestPoSCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.config = cls.basic_config
        cls.config.display_default_code = True
        cls.product = cls.env["product.product"].create(
            {
                "name": "Archived Product",
                "default_code": "TEST0001",
                "available_in_pos": True,
            }
        )
        cls.product.active = False

    def test01_archived_product_loaded_with_code_when_requested(self):
        domain = [("id", "=", self.product.id)]
        loaded = self.env["product.product"]._load_product_with_domain(
            domain, self.config.id, True
        )
        self.assertEqual(
            [(product["id"], product["display_name"]) for product in loaded],
            [(self.product.id, "[TEST0001] Archived Product")],
        )

    def test02_archived_product_skipped_when_not_requested(self):
        domain = [("id", "=", self.product.id)]
        loaded = self.env["product.product"]._load_product_with_domain(
            domain, self.config.id
        )
        self.assertFalse(loaded)
