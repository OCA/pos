# Copyright 2025 Binhex - Adasat Torres de León
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests.common import TransactionCase


class PosHideReceiptLine(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.ProductTemplate = cls.env["product.template"]
        cls.pos_session = cls.env["pos.session"].create(
            {
                "name": "Test Session",
                "config_id": cls.env.ref("point_of_sale.pos_config_main").id,
            }
        )
        cls.product = cls.ProductTemplate.create(
            {
                "name": "Test Product",
                "available_in_pos": True,
                "pos_hide_receipt_line": True,
            }
        )

    def test_hide_receipt_line(self):
        self.assertTrue(self.product.pos_hide_receipt_line)

    def test_product_in_pos_session(self):
        params = self.pos_session._loader_params_product_product()
        self.assertIn("pos_hide_receipt_line", params["search_params"]["fields"])
