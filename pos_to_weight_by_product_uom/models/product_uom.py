# -*- coding: utf-8 -*-
# Copyright 2017, Grap
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from openerp import fields, models


class ProductUom(models.Model):
    _inherit = 'product.uom'

    to_weigh = fields.Boolean(
        related='category_id.to_weigh',
        readonly=True)
