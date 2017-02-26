# -*- coding: utf-8 -*-
# © <2015> <Akretion, GRAP, OCA>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields, api


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    @api.multi
    def _get_has_image(self):
        self.ensure_one()
        self.has_image = self.image is not False

    has_image = fields.Boolean(compute='_get_has_image', string='Has Image')
