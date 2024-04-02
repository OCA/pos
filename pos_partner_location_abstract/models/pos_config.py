# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    geolocalize_tech_name = fields.Char(compute="_compute_geolocalize")

    @api.model
    def _set_extended_data(self):
        return {}

    def _set_pos_config_parameter(self, tech_name, ext_vals=None):
        _ = ext_vals or {}
        for config in self:
            config.geolocalize_tech_name = tech_name

    def _compute_geolocalize(self):
        ICPSudo = self.env["ir.config_parameter"].sudo()
        geo_provider_obj = self.env["base.geo_provider"]
        geo_provider_id = ICPSudo.get_param("base_geolocalize.geo_provider")
        provider = geo_provider_obj.browse(int(geo_provider_id))
        tech_name = provider.tech_name
        ext_vals = self._set_extended_data()
        self._set_pos_config_parameter(tech_name, ext_vals)
