# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import json

from odoo.tests import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestPosProductMultiBarcode(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.product = cls.env["product.product"].create({"name": "Test product"})
        cls.barcode_a = "MULTI-BARCODE-A"
        cls.barcode_b = "MULTI-BARCODE-B"
        cls.config = cls.env["pos.config"].create({"name": "Test POS"})

    def test_barcodes_json_empty_when_no_barcodes(self):
        self.assertEqual(json.loads(self.product.barcodes_json), [])

    def test_barcodes_json_lists_all_barcodes_in_sequence(self):
        self.product.barcode_ids = [
            (0, 0, {"name": self.barcode_b, "sequence": 20}),
            (0, 0, {"name": self.barcode_a, "sequence": 10}),
        ]
        self.assertEqual(
            json.loads(self.product.barcodes_json),
            [self.barcode_a, self.barcode_b],
        )

    def test_barcodes_json_is_valid_json_string(self):
        self.product.barcode_ids = [(0, 0, {"name": self.barcode_a})]
        self.assertIsInstance(self.product.barcodes_json, str)
        self.assertEqual(json.loads(self.product.barcodes_json), [self.barcode_a])

    def test_barcodes_json_recomputes_when_barcodes_change(self):
        self.product.barcode_ids = [
            (0, 0, {"name": self.barcode_a}),
            (0, 0, {"name": self.barcode_b}),
        ]
        self.assertEqual(len(json.loads(self.product.barcodes_json)), 2)
        self.product.barcode_ids.filtered(lambda b: b.name == self.barcode_a).unlink()
        self.assertEqual(json.loads(self.product.barcodes_json), [self.barcode_b])

    def test_load_pos_data_fields_includes_barcodes_json(self):
        fields = self.product._load_pos_data_fields(self.config)
        self.assertIn("barcodes_json", fields)

    def test_load_pos_data_fields_does_not_duplicate_barcodes_json(self):
        fields = self.product._load_pos_data_fields(self.config)
        self.assertEqual(fields.count("barcodes_json"), 1)

    def test_load_pos_data_fields_keeps_core_barcode_field(self):
        fields = self.product._load_pos_data_fields(self.config)
        self.assertIn("barcode", fields)
