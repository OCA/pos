# -*- coding: utf-8 -*-
# Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields, api, tools


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    pos_categ_id = fields.Many2one('product.category',
                                   store=False,
                                   related='categ_id',
                                   search='_search_pos_categ_id')

    @api.multi
    def _search_pos_categ_id(self, operator, value):
        return [('categ_id', operator, value)]

    @api.model
    def create(self, vals):
        if 'categ_id' in vals:
            vals['pos_categ_id'] = vals['categ_id']
        return super(ProductTemplate, self).create(vals)

    @api.multi
    def write(self, vals):
        if 'pos_categ_id' in vals and not vals['pos_categ_id']:
            del vals['pos_categ_id']
        return super(ProductTemplate, self).write(vals)


class ProductCategory(models.Model):
    _inherit = 'product.category'

    image = fields.Binary(help='Show Image Category in Form View')
    image_medium = fields.Binary(help='Show image category button in POS',
                                 compute="_compute_image",
                                 inverse="_set_image",
                                 store=True)
    available_in_pos = fields.Boolean(
        string="Available in the Point of Sale",
        default=True,
        help="Check if you want this category to appear in Point Of Sale.\n"
             "If you uncheck, children categories will becomes invisible too, "
             "whatever their checkbox state.")

    @api.multi
    def _compute_image(self):
        return dict(
            (rec.id, tools.image_get_resized_images(rec.image)) for rec in
            self)

    @api.one
    def _set_image(self):
        return self.write(
            {'image': tools.image_resize_image_big(self.image_medium)})
