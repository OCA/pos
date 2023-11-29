# Part of Odoo. See LICENSE file for full copyright and licensing details.

import odoo.tests

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestLotScanning(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)

        cls.lot_product_1 = cls.env["product.product"].create(
            {
                "name": "Lot Product 1",
                "type": "product",
                "tracking": "lot",
                "categ_id": cls.env.ref("product.product_category_all").id,
                "available_in_pos": True,
            }
        )
        cls.lot_product_2 = cls.env["product.product"].create(
            {
                "name": "Lot Product 2",
                "type": "product",
                "tracking": "lot",
                "categ_id": cls.env.ref("product.product_category_all").id,
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
            ]
        )

    def test_scan_lot_number(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "LotScanningTour",
            login="pos_user",
        )

    def test_scan_to_input_lot_number(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "LotScanningInsteadofInputTour",
            login="pos_user",
        )
