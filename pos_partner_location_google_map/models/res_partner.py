# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.model
    def _get_map_provider_tech_name(self):
        """Get map provider technical name"""
        ICPSudo = self.env["ir.config_parameter"].sudo()
        geo_provider_obj = self.env["base.geo_provider"]
        geo_provider_id = ICPSudo.get_param("base_geolocalize.geo_provider")
        provider = geo_provider_obj.browse(int(geo_provider_id))
        return provider.tech_name

    def _compute_qr_code_url(self):
        if self._get_map_provider_tech_name() != "googlemap":
            return super()._compute_qr_code_url()
        map_url = "https://maps.google.com/maps?q={},{}"
        for rec in self:
            rec.qr_code_url = (
                map_url.format(rec.partner_latitude, rec.partner_longitude)
                if rec.partner_latitude and rec.partner_longitude
                else ""
            )
