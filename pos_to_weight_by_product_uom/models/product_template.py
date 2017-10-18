# -*- coding: utf-8 -*-
# Copyright 2017, Grap
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from openerp import api, models


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    @api.multi
    def onchange_uom(self, uom_id, uom_po_id):
        res = super(ProductTemplate, self).onchange_uom(uom_id, uom_po_id)
        if uom_id:
            if res.get('value', False):
                res['value']['to_weight'] =\
                    self.env['product.uom'].browse(uom_id).to_weigh
        return res
