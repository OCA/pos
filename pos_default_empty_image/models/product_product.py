# Copyright (C) 2017 - Today:
#   GRAP (http://www.grap.coop)
#   Akretion (http://www.akretion.com)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields, api


class ProductProduct(models.Model):
    _inherit = 'product.product'

    @api.depends('image_1920')
    def _compute_has_image(self):
        for product in self:
            product.has_image = product.image_1920

    has_image = fields.Boolean(
        compute='_compute_has_image', string='Has Image', store=True)
