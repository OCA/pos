# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import requests


class AddressStruct(object):
    ADDR_FIELDS = {}
    ODOO_ADDR = [
        "street",
        "city",
        "state_id",
        "country_id",
        "zip",
    ]
    SERVICE_URL = None

    def __init__(self, odoo_env):
        self._result = {}
        self.env = odoo_env
        self.status = None

    @property
    def street(self):
        """
        Street name
        :rtype str | bool
        """
        return False

    @property
    def city(self):
        """
        City name
        :rtype: str | bool
        """
        return False

    @property
    def state_id(self):
        """
        Fed. State
        :rtype: record (res.country.state) | bool
        """
        return False

    @property
    def country_id(self):
        """
        Country
        :rtype: record (res.country) | bool
        """
        return False

    @property
    def zip(self):
        """
        Zip code
        :rtype: str | bool
        """
        return False

    def get_result(self):
        """
        Get result for updating contact address
        :return:fields values
        :rtype: dict
        """
        return {item: getattr(self, item) for item in self.ODOO_ADDR}

    def query_addr(self, params, timeout=5):
        """
        Query to service for get address result
        :param dict params: query params
        :param int timeout: request timeout
        :return: json object
        :rtype: dict | bool
        """
        response = requests.get(self.SERVICE_URL, params, timeout=timeout)
        if response.status_code == 200:
            return response.json()
        return False
