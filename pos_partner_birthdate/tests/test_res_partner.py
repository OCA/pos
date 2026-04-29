# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo.tests.common import TransactionCase


class TestResPartnerPOSBirthdate(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.partner = cls.env["res.partner"].create(
            {
                "name": "Test Partner",
            }
        )
        cls.config = cls.env["pos.config"].create({"name": "Test POS"})

    def test_load_pos_data_fields_includes_birthdate(self):
        fields = self.partner._load_pos_data_fields(self.config.id)
        self.assertIn("birthdate_date", fields)
        self.assertEqual(fields.count("birthdate_date"), 1)
