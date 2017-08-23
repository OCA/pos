# -*- coding: utf-8 -*-
# Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import sys
from openerp import models, fields, api, tools


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    pos_categ_id = fields.Many2one('product.category',
                                   store=True, related='categ_id')

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
                                 compute="_get_image",
                                 inverse="_set_image",
                                 store=True)
    available_in_pos = fields.Boolean(
        string="Available in the Point of Sale",
        default=True,
        help="Check if you want this category to appear in Point Of Sale.\n"
             "If you uncheck, children categories will becomes invisible too, "
             "whatever their checkbox state.")

    @api.multi
    def _get_image(self):
        return dict(
            (rec.id, tools.image_get_resized_images(rec.image)) for rec in
            self)

    @api.one
    def _set_image(self):
        return self.write(
            {'image': tools.image_resize_image_big(self.image_medium)})


_auto_end_original = models.BaseModel._auto_end


def _auto_end(self, cr, context=None):
    """ Create the foreign keys recorded by _auto_init.
        (pos_remove_pos_category monkey patching)
    """
    context = context or {}
    module = context['module']
    foreign_keys = []
    patched = 'openerp.addons.pos_remove_pos_category' in sys.modules

    for t, k, r, d in self._foreign_keys:
        if patched and (t, k) == ('product_template', 'pos_categ_id'):
            if module == 'pos_remove_pos_category':
                cr.execute('''
                    ALTER TABLE product_template
                    DROP CONSTRAINT IF EXISTS
                    product_template_pos_categ_id_fkey
                ''')
                cr.execute('''
                    UPDATE product_template
                    SET pos_categ_id = categ_id;
                ''')
                cr.execute('''
                    ALTER TABLE product_template ADD CONSTRAINT
                    "product_template_pos_categ_id_fkey"
                    FOREIGN KEY (pos_categ_id)
                    REFERENCES product_category(id) ON DELETE SET NULL;
                ''')
            continue
        foreign_keys.append((t, k, r, d))
    self._foreign_keys = foreign_keys
    return _auto_end_original(self, cr, context=context)


models.BaseModel._auto_end = _auto_end
