# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    googlemap_api_key = fields.Char(compute="_compute_geolocalize")

    @api.model
    def _set_extended_data(self):
        data = super(PosConfig, self)._set_extended_data()
        ICPSudo = self.env["ir.config_parameter"].sudo()
        data.update(
            api_key=ICPSudo.get_param("base_geolocalize.google_map_api_key", False)
        )
        return data

    def _set_pos_config_parameter(self, tech_name, ext_vals=None):
        super(PosConfig, self)._set_pos_config_parameter(tech_name, ext_vals)
        key = ext_vals.get("api_key", "") if tech_name == "googlemap" else ""
        for config in self:
            config.googlemap_api_key = key
        return
