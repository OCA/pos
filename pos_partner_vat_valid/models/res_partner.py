# Copyright 2025 APSL-Nagarro Antoni Marroig
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.model
    def vat_check(self, vat, country_id):
        country_code = self.env["res.country"].browse(int(country_id)).code.lower()
        split_vat = self._split_vat(vat)
        return (
            split_vat[0] == country_code
            and self.simple_vat_check(country_code, split_vat[1].upper())
        ) or (
            split_vat[0] != country_code
            and self.simple_vat_check(country_code, vat.upper())
        )
