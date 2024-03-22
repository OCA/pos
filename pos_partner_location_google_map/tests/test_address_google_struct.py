# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from unittest import mock

from odoo.tests import TransactionCase

from odoo.addons.pos_partner_location_google_map.models.address_google_struct import (
    AddressGoogleStruct,
)

from .common import FORMATTED_RESULT, RESPONSE_MAP


class TestAddressGoogleStruct(TransactionCase):
    def setUp(self):
        super(TestAddressGoogleStruct, self).setUp()
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.google_map_api_key", "GoogleMapKey"
        )
        self.state_ny = self.env["res.country.state"].search(
            [("code", "=", "NY")], limit=1
        )
        self.country_us = self.env["res.country"].search([("code", "=", "US")], limit=1)
        self.google_struct = AddressGoogleStruct(self.env)

    def test_init(self):
        self.assertEqual(self.google_struct.api_key, "GoogleMapKey")

    def test_has_token(self):
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.google_map_api_key", ""
        )
        google = AddressGoogleStruct(self.env)
        self.assertFalse(google.has_token())
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.google_map_api_key", "GoogleMapKey"
        )
        google = AddressGoogleStruct(self.env)
        self.assertTrue(google.has_token())

    def test_get_fields_value(self):
        result = self.google_struct._get_fields_value("number")
        self.assertListEqual(result, [False])
        result = self.google_struct._get_fields_value("street")
        self.assertListEqual(result, [False, False, False])

    @mock.patch("requests.get")
    def test_query_addr_valid(self, mock_get):
        mock_response = mock.Mock(status_code=200)
        mock_response.json.return_value = {
            "result": {"address_components": []},
            "status": "OK",
        }
        mock_get.return_value = mock_response
        response = self.google_struct.query_addr({})
        self.assertTrue(response)

    @mock.patch("requests.get")
    def test_query_addr_invalid(self, mock_get):
        mock_response = mock.Mock(status_code=200)
        mock_response.json.return_value = {
            "result": {"address_components": []},
            "status": "ERR",
        }
        mock_get.return_value = mock_response
        response = self.google_struct.query_addr({})
        self.assertFalse(response)

    def test_street(self):
        self.assertEqual(self.google_struct.street, "")
        self.google_struct._result.update(
            street_number="1", street_address="Test Address"
        )
        self.assertEqual(self.google_struct.street, "1 Test Address")

    def test_city(self):
        self.assertFalse(self.google_struct.city)
        self.google_struct._result.update(sublocality="Tallin")
        self.assertEqual(self.google_struct.city, "Tallin")

    def test_zip(self):
        self.assertFalse(self.google_struct.zip)
        self.google_struct._result.update(postal_code="524124")
        self.assertEqual(self.google_struct.zip, "524124")

    def test_prepare_components_data(self):
        self.google_struct._prepare_components_data(
            RESPONSE_MAP["result"]["address_components"]
        )
        self.assertDictEqual(self.google_struct._result, FORMATTED_RESULT)

    def test_country_id(self):
        self.assertFalse(self.google_struct.country_id)
        self.google_struct._result.update(
            country={"code": "US", "name": "United States"}
        )
        self.assertEqual(self.google_struct.country_id, self.country_us.name_get()[0])

    def test_state_id(self):
        self.assertFalse(self.google_struct.state_id)
        self.google_struct._result.update(
            country={"code": "US", "name": "United States"},
            administrative_area_level_2={"code": "Kings", "name": "Kings"},
            administrative_area_level_1={"code": "NY", "name": "New York"},
        )
        self.assertEqual(self.google_struct.state_id, self.state_ny.name_get()[0])
