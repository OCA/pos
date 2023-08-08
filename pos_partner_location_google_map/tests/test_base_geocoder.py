# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from unittest import mock

from odoo.exceptions import UserError
from odoo.tests import TransactionCase

from .common import RESPONSE_MAP


class TestBaseGeocoder(TransactionCase):
    def test_prepare_geo_address_googlemap_invalid(self):
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.google_map_api_key", ""
        )
        with self.assertRaises(UserError):
            self.env["base.geocoder"].prepare_geo_address_googlemap("test_place")

    @mock.patch("requests.get")
    def test_prepare_geo_address_googlemap_valid(self, mock_get):
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.google_map_api_key", "GoogleMapKey"
        )
        self.state_ny = self.env["res.country.state"].search(
            [("code", "=", "NY")], limit=1
        )
        self.country_us = self.env["res.country"].search([("code", "=", "US")], limit=1)
        mock_response = mock.Mock(status_code=200)
        mock_response.json.return_value = RESPONSE_MAP
        mock_get.return_value = mock_response
        response = self.env["base.geocoder"].prepare_geo_address_googlemap("test_place")
        expected_value = {
            "city": "Brooklyn",
            "country_id": self.country_us.name_get()[0],
            "state_id": self.state_ny.name_get()[0],
            "street": "277 Bedford Ave",
            "zip": "11211",
        }
        self.assertDictEqual(response, expected_value)
