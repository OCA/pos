# Copyright 2021 Camptocamp SA - Iván Todorovich
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests.common import SavepointCase


class TestPosPartnerLang(SavepointCase):
    def setUp(self):
        super().setUp()
        # Activate lang fr
        self.env.ref("base.lang_fr").active = True

    def test_01_create_from_ui(self):
        partner_id = self.env["res.partner"].create_from_ui(
            {"name": "Test Partner", "lang": "fr_FR"}
        )
        partner = self.env["res.partner"].browse(partner_id)
        self.assertEqual(partner.lang, "fr_FR")
