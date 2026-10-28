# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo.tests.common import TransactionCase


class TestPosConfigQzFields(TransactionCase):
    """Tests for the pos.config fields added by pos_printing_qz."""

    def test_is_qztray_field_is_boolean(self):
        field = self.env["pos.config"]._fields.get("is_qztray")
        self.assertIsNotNone(field, "Field is_qztray must exist on pos.config")
        self.assertEqual(field.type, "boolean")

    def test_is_qztray_defaults_false(self):
        field = self.env["pos.config"]._fields.get("is_qztray")
        # Resolve the default value the same way Odoo does at create time
        default_val = field.default
        if callable(default_val):
            default_val = default_val(self.env["pos.config"])
        self.assertFalse(default_val, "is_qztray must default to False")

    def test_iface_qztray_printer_id_field_is_many2one(self):
        field = self.env["pos.config"]._fields.get("iface_qztray_printer_id")
        self.assertIsNotNone(
            field, "Field iface_qztray_printer_id must exist on pos.config"
        )
        self.assertEqual(field.type, "many2one")

    def test_iface_qztray_printer_id_comodel_is_printing_printer(self):
        field = self.env["pos.config"]._fields.get("iface_qztray_printer_id")
        self.assertEqual(
            field.comodel_name,
            "printing.printer",
            "iface_qztray_printer_id must relate to printing.printer",
        )

    def test_iface_qztray_printer_id_not_required(self):
        field = self.env["pos.config"]._fields.get("iface_qztray_printer_id")
        self.assertFalse(field.required, "iface_qztray_printer_id must not be required")
