# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests.common import TransactionCase


class TestPosStockScrapCreate(TransactionCase):
    def setUp(self):
        super().setUp()

        self.product_model = self.env["product.product"]
        self.scrap_model = self.env["stock.scrap"]

    def test_create_and_do_regular_scrap(self):
        product_id = self.product_model.search(
            [("variant_bom_ids", "=", False)], limit=1
        )

        regular_scrap_vals = {
            "product_id": product_id.id,
            "product_uom_id": product_id.uom_id.id,
            "scrap_qty": 1,
        }
        regular_scrap = self.scrap_model.create_and_do_scraps(regular_scrap_vals)

        self.assertEqual(len(regular_scrap), 1)
        self.assertEqual(regular_scrap.state, "done")

    def test_create_and_do_bom_scraps(self):
        product_with_bom = self.product_model.search(
            [("variant_bom_ids", "not in", [])], limit=1
        )

        scrap_bom_vals = {
            "product_id": product_with_bom.id,
            "product_uom_id": product_with_bom.uom_id.id,
            "scrap_qty": 1,
        }
        bom_scraps = self.scrap_model.create_and_do_scraps(scrap_bom_vals)
        bom_states = set(bom_scraps.mapped("state"))

        self.assertGreaterEqual(len(bom_scraps), 1)
        self.assertEqual(len(bom_states), 1)
        self.assertEqual(list(bom_states)[0], "done")
