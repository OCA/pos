# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


@tagged("post_install", "-at_install")
class TestPosConfig(TestPointOfSaleCommon):
    def setUp(self):
        super(TestPosConfig, self).setUp()
        self.provider_open_street = self.env.ref(
            "base_geolocalize.geoprovider_open_street"
        )
        self.provider_google_map = self.env.ref(
            "base_geolocalize.geoprovider_google_map"
        )

    def test_provider_not_set(self):
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.geo_provider", False
        )
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.google_map_api_key", ""
        )
        self.assertFalse(
            self.pos_config.geolocalize_tech_name, msg="Geo Provider must be False"
        )
        self.assertFalse(
            self.pos_config.googlemap_api_key, msg="GoogleMap API Key must be False"
        )

    def test_provider_google_map(self):
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.geo_provider", self.provider_google_map.id
        )
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.google_map_api_key", ""
        )
        self.assertEqual(
            self.pos_config.geolocalize_tech_name,
            "googlemap",
            msg="Geo Provider Tech Name must be equal 'googlemap'",
        )
        self.assertFalse(
            self.pos_config.googlemap_api_key, msg="GoogleMap API Key must be False"
        )

    def test_provider_open_street_map(self):
        self.env["ir.config_parameter"].set_param(
            "base_geolocalize.geo_provider", self.provider_open_street.id
        )
        self.assertEqual(
            self.pos_config.geolocalize_tech_name,
            "openstreetmap",
            msg="Geo Provider Tech Name must be equal 'openstreetmap'",
        )
