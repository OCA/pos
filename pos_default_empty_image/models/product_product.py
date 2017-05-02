# -*- coding: utf-8 -*-
# © <2015> <Akretion, GRAP, OCA>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from openerp import api, fields, models


class ProductProduct(models.Model):
    _inherit = ['product.product']

    @api.multi
    @api.depends('image')
    def _compute_has_image(self):
        for record in self:
            record.has_image = bool(record.image)

    has_image = fields.Boolean(
        compute='_compute_has_image',
        store=True,
        readonly=True,
    )
