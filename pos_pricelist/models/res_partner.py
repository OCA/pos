# -*- coding: utf-8 -*-
# Copyright 2018 Tecnativa - Jairo Llopis
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import api, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.model
    def create_from_ui(self, partner):
        try:
            # If there's an incoming pricelist, it must be an int
            partner["property_product_pricelist"] = \
                int(partner["property_product_pricelist"])
        except KeyError:
            # There's no incoming pricelist, no problem
            pass
        return super(ResPartner, self).create_from_ui(partner)
