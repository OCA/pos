# Part of Odoo. See LICENSE file for full copyright and licensing details.

import odoo.tests

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestLotScanning(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.lot_product_1 = cls.env["product.product"].create(
            {
                "name": "Lot Product 1",
                "type": "consu",
                "tracking": "lot",
                "categ_id": cls.env.ref("product.product_category_goods").id,
                "available_in_pos": True,
            }
        )
        cls.lot_product_2 = cls.env["product.product"].create(
            {
                "name": "Lot Product 2",
                "type": "consu",
                "tracking": "lot",
                "categ_id": cls.env.ref("product.product_category_goods").id,
                "available_in_pos": True,
            }
        )
        cls.lot_product_3 = cls.env["product.product"].create(
            {
                "name": "Lot Product 3",
                "type": "consu",
                "tracking": "lot",
                "categ_id": cls.env.ref("product.product_category_goods").id,
                "available_in_pos": True,
            }
        )
        cls.env["stock.lot"].create(
            [
                {
                    "name": "10120000515",
                    "product_id": cls.lot_product_1.id,
                    "company_id": cls.env.company.id,
                },
                {
                    "name": "10120000516",
                    "product_id": cls.lot_product_1.id,
                    "company_id": cls.env.company.id,
                },
                {
                    "name": "10120000516",
                    "product_id": cls.lot_product_2.id,
                    "company_id": cls.env.company.id,
                },
                {
                    "name": "10120000517",
                    "product_id": cls.lot_product_3.id,
                    "company_id": cls.env.company.id,
                },
            ]
        )

    def test_scan_lot_number(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "LotScanningTour",
            login="pos_user",
            timeout=60,
        )

    def test_scan_lot_number_limited_product_count(self):
        """
        Test that ensures that scanning a lot of a product that is not loaded
        in the product screen (due to limited_product_count) still works.
        """
        ICP = self.env["ir.config_parameter"].sudo()
        ICP.set_param("point_of_sale.limited_product_count", 1)
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "LotScanningTourLimitedProductCount",
            login="pos_user",
            timeout=60,
        )

    def test_scan_to_input_lot_number(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "LotScanningInsteadofInputTour",
            login="pos_user",
            timeout=60,
        )
