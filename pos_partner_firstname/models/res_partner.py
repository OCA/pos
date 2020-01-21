# Copyright 2019 Roberto Fichera
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    @api.model
    def create_from_ui(self, partner):
        if 'is_company' in partner:
            partner['is_company'] = partner['is_company'] == 'true'
        return super(ResPartner, self).create_from_ui(partner)

    @api.model
    def get_names_order(self):
        """Allow POS frontend to retrieve 'partner_names_order'"""
        return self._get_names_order()
