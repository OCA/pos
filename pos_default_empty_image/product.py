# -*- coding: utf-8 -*-
# © <2015> <Akretion, GRAP, OCA>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields, api


class ProductTemplate(models.Model):
    _inherit = ['product.template']

    @api.multi
    @api.depends('field.image')
    def _has_image(self):
        for record in self:
            record.has_image = bool(record.image)

    has_image = fields.Boolean(
        compute='_has_image',
        store=True,
        readonly=True)
