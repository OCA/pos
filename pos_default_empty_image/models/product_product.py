# -*- coding: utf-8 -*-
# © <2015> <Akretion, GRAP, OCA>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields, api


class ProductProduct(models.Model):
    _inherit = 'product.product'

    @api.multi
    @api.depends('image')
    def _compute_has_image(self):
        for product in self:
            product.has_image = product.image is not False

    has_image = fields.Boolean(
        compute='_compute_has_image', string='Has Image', store=True)
