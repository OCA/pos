# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from unittest import mock

from odoo.tests import TransactionCase

from odoo.addons.pos_partner_location_abstract.models.address_struct import (
    AddressStruct,
)


class TestAddressStruct(TransactionCase):
    def setUp(self):
        super(TestAddressStruct, self).setUp()
        self.addr_struct = AddressStruct(self.env)

    def test_init(self):
        self.assertIsNone(self.addr_struct.status, msg="Status must be is None")
        self.assertEqual(self.addr_struct._result, {}, msg="Result must be empty dict")
        self.assertEqual(self.addr_struct.env, self.env, msg="Env must be the same")

    def test_street(self):
        self.assertFalse(self.addr_struct.street, msg="Street must be False")

    def test_city(self):
        self.assertFalse(self.addr_struct.city, msg="City must be False")

    def test_state_id(self):
        self.assertFalse(self.addr_struct.state_id, msg="Stage must be False")

    def test_country_id(self):
        self.assertFalse(self.addr_struct.country_id, msg="Country must be False")

    def test_zip(self):
        self.assertFalse(self.addr_struct.zip, msg="Zip must be False")

    @mock.patch("requests.get")
    def test_query_addr_valid(self, mock_get):
        mock_response = mock.Mock(status_code=200)
        mock_response.json.return_value = {"status": "OK"}
        mock_get.return_value = mock_response
        response = self.addr_struct.query_addr({})
        self.assertEqual(
            response.get("status"), "OK", msg="Status must be equal to 'OK'"
        )

    def test_get_result(self):
        obj = {
            "street": False,
            "city": False,
            "state_id": False,
            "country_id": False,
            "zip": False,
        }
        self.assertDictEqual(
            self.addr_struct.get_result(), obj, msg="Dicts must be the same"
        )

    @mock.patch("requests.get")
    def test_query_addr_invalid(self, mock_get):
        mock_response = mock.Mock(status_code=404)
        mock_get.return_value = mock_response
        response = self.addr_struct.query_addr({})
        self.assertFalse(response, msg="Response must be the same")
