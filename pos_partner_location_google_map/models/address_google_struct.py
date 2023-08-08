# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.osv.expression import AND, OR

from odoo.addons.pos_partner_location_abstract.models.address_struct import (
    AddressStruct,
)


class AddressGoogleStruct(AddressStruct):
    ADDR_FIELDS = {
        "number": ["street_number"],
        "street": ["street_address", "route", "plus_code"],
        "city": [
            "locality",
            "sublocality",
            "sublocality_level_1",
            "sublocality_level_2",
            "sublocality_level_3",
            "sublocality_level_4",
        ],
        "state_id": [
            "administrative_area_level_1",
            "administrative_area_level_2",
            "administrative_area_level_3",
            "administrative_area_level_4",
            "administrative_area_level_5",
        ],
        "country_id": ["country"],
        "zip": ["postal_code"],
    }
    SERVICE_URL = "https://maps.googleapis.com/maps/api/place/details/json"

    def __init__(self, odoo_env):
        super(AddressGoogleStruct, self).__init__(odoo_env)
        self.api_key = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_param("base_geolocalize.google_map_api_key", False)
        )

    def has_token(self):
        """Checking exists Google API key in settings"""
        return bool(self.api_key)

    def _get_fields_value(self, addr_key):
        """
        Get fields value for preparing values address
        :param str addr_key: field name
        :return list: list of fields values
        """
        return [self._result.get(key, False) for key in self.ADDR_FIELDS[addr_key]]

    @property
    def street(self):
        street_number = self._result.get("street_number")
        result = []
        if street_number:
            result.append(street_number)
        for address in self._get_fields_value("street"):
            if address:
                result.append(address)
                return " ".join(result)
        return ""

    @property
    def city(self):
        for city in self._get_fields_value("city"):
            if city:
                return city
        return False

    @property
    def state_id(self):
        domain = []
        codes = []
        for state in self._get_fields_value("state_id"):
            if state:
                domain = OR([domain, [("name", "like", state.get("name"))]])
                codes.append(state.get("code"))
        if codes:
            domain = OR([domain, [("code", "in", codes)]])
        if len(domain) == 0:
            return False
        country_id = self.country_id
        if country_id:
            domain = AND([domain, [("country_id", "=", country_id[0])]])
        state = self.env["res.country.state"].search(domain, limit=1)
        return state.name_get()[0] if state else False

    @property
    def country_id(self):
        country_item = self._result.get("country")
        if not country_item:
            return False
        country = self.env["res.country"].search(
            [
                "|",
                ("name", "like", country_item.get("name")),
                ("code", "=", country_item.get("code")),
            ]
        )
        return country.name_get()[0] if country else False

    @property
    def zip(self):
        return self._result.get("postal_code")

    def query_addr(self, params, timeout=5):
        params.update(key=self.api_key)
        response = super(AddressGoogleStruct, self).query_addr(params, timeout=timeout)
        if response:
            if response.get("status") == "OK":
                self._prepare_components_data(response["result"]["address_components"])
                return True
        return False

    def _prepare_components_data(self, components):
        """
        Preparing component values for class result
        :param dict components: list of components
        :return: None
        :rtype: NoneType
        """
        state_country_fields = [
            *self.ADDR_FIELDS.get("state_id", []),
            *self.ADDR_FIELDS.get("country_id", []),
        ]
        for component in components:
            for type_ in component["types"]:
                if type_ in state_country_fields:
                    self._result[type_] = {
                        "code": component["short_name"],
                        "name": component["long_name"],
                    }
                elif type_ in self.ADDR_FIELDS.get("street", []):
                    self._result[type_] = component["short_name"]
                else:
                    self._result[type_] = component["long_name"]
