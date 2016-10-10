# -*- coding: utf-8 -*-
# Copyright (C) 2014-Today GRAP (http://www.grap.coop)
# Copyright (C) 2016-Today La Louve (http://www.lalouve.net)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields, api

from .barcode_rule import _GENERATE_TYPE


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    # Related to display product product information if is_product_variant
    barcode_rule_id = fields.Many2one(
        related='product_variant_ids.barcode_rule_id',
        string='Barcode Rule', comodel_name='barcode.rule')

    barcode_base = fields.Integer(
        related='product_variant_ids.barcode_base',
        string='Barcode Base')

    generate_type = fields.Selection(
        string='Generate Type', selection=_GENERATE_TYPE, readonly=True,
        related='product_variant_ids.barcode_rule_id.generate_type')

    # View Section
    @api.multi
    def generate_base(self):
        self.product_variant_ids.generate_base()

    @api.multi
    def generate_barcode(self):
        self.product_variant_ids.generate_barcode()

    @api.onchange('barcode_rule_id')
    def onchange_barcode_rule_id(self):
        if self.barcode_rule_id:
            self.generate_type = self.barcode_rule_id.generate_type
        else:
            self.generate_type = False

    # Overload Section
    @api.model
    def create(self, vals):
        template = super(ProductTemplate, self).create(vals)

        # this is needed to set given values to first variant after creation
        # these fields should be moved to product as lead to confusion
        # (Ref. product module feature in Odoo Core)
        related_vals = {}
        for field in ['barcode_rule_id', 'barcode_base']:
            if vals.get(field, False):
                related_vals[field] = vals[field]
            if related_vals:
                template.write(related_vals)
        return template
