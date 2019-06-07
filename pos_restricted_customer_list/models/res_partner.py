# -*- coding: utf-8 -*-
# Copyright 2017-2019 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from openerp import fields, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    available_in_pos = fields.Boolean(
        string="Available for POS",
        default=False,
    )

    def create_from_ui(self, cr, uid, partner, context=None):
        if not partner.get('available_in_pos'):
            partner['available_in_pos'] = True
        return super(ResPartner, self).create_from_ui(
            cr, uid, partner, context)
