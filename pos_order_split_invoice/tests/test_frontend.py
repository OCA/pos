# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import odoo.tests

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPointOfSaleSplitInvoie(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)
        cls.product_1 = cls.env["product.product"].create(
            {
                "name": "Split Product 1",
                "type": "consu",
                "categ_id": cls.env.ref("product.product_category_all").id,
                "available_in_pos": True,
            }
        )
        cls.partner = cls.env["res.partner"].create({"name": "Splitting Partner"})
        cls.pricelist_1 = cls.env["product.pricelist"].create(
            {
                "name": "Initial pricelist",
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "applied_on": "0_product_variant",
                            "product_id": cls.product_1.id,
                            "compute_price": "fixed",
                            "fixed_price": 100,
                        },
                    )
                ],
            }
        )
        cls.pricelist_2 = cls.env["product.pricelist"].create(
            {
                "name": "Splitter pricelist",
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "applied_on": "0_product_variant",
                            "product_id": cls.product_1.id,
                            "compute_price": "fixed",
                            "fixed_price": 90,
                        },
                    )
                ],
            }
        )
        cls.pricelist_3 = cls.env["product.pricelist"].create(
            {
                "name": "Splitting Pricelist",
                "split_invoice_partner_id": cls.partner.id,
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "applied_on": "0_product_variant",
                            "product_id": cls.product_1.id,
                            "compute_price": "split",
                            "base": "pricelist",
                            "base_pricelist_id": cls.pricelist_1.id,
                            "split_base": "pricelist",
                            "split_base_pricelist_id": cls.pricelist_2.id,
                            "split_percentage": 90,
                        },
                    )
                ],
            }
        )
        cls.main_pos_config.pricelist_id = False
        cls.main_pos_config.available_pricelist_ids = (
            cls.pricelist_1 | cls.pricelist_2 | cls.pricelist_3
        )

    def test_lot_selection(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()

        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "SplitInvoice",
            login="pos_user",
        )
        move = self.env["account.move"].search([("partner_id", "=", self.partner.id)])
        self.assertTrue(move)
        self.assertEqual(move.amount_untaxed, 81)
        order = self.main_pos_config.current_session_id.order_ids
        self.assertTrue(order)
        self.assertAlmostEqual(19, order.amount_total - order.amount_tax)
