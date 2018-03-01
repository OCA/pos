# coding: utf-8
# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    @api.model
    def create_from_ui(self, partner):
        if 'property_product_pricelist' in partner:
            pricelist_id_str = partner.get('property_product_pricelist')
            if pricelist_id_str:
                partner['property_product_pricelist'] = int(pricelist_id_str)
            else:
                partner['property_product_pricelist'] = False
        return super(ResPartner, self).create_from_ui(partner)
