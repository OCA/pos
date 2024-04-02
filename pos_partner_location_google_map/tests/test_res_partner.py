# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests import TransactionCase

from .common import RESPONSE_MAP


class TestResPartner(TransactionCase):
    def setUp(self):
        super().setUp()
        self.provider_google_map = self.env.ref(
            "base_geolocalize.geoprovider_google_map"
        )
        lat_long_struct = RESPONSE_MAP["result"]["geometry"]["location"]
        self.partner = self.env["res.partner"].create(
            {
                "name": "Bob",
                "partner_latitude": lat_long_struct["lat"],
                "partner_longitude": lat_long_struct["lng"],
            }
        )
        self.map_url = "https://maps.google.com/maps?q={},{}"

    def test_compute_qr_code_url_provider(self):
        """Test flow that computes qr code url by provider"""
        # Without provider
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.geo_provider", False
        )
        self.assertEqual(self.partner.qr_code_url, "", "QR URL must be empty")

        # Google provider
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.geo_provider", self.provider_google_map.id
        )
        self.partner._compute_qr_code_url()
        self.assertEqual(
            self.partner.qr_code_url,
            self.map_url.format(
                self.partner.partner_latitude, self.partner.partner_longitude
            ),
            "QR URL must be the same",
        )
