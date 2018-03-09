# coding: utf-8
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Quentin DUPONT <quentin.dupont@grap.coop>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from openerp import api, models


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    @api.multi
    def onchange_uom(self, uom_id, uom_po_id):
        res = super(ProductTemplate, self).onchange_uom(uom_id, uom_po_id)
        if uom_id:
            res = res and res or {}
            if not res.get('value', False):
                res['value'] = {}
            res['value']['to_weight'] =\
                self.env['product.uom'].browse(uom_id).to_weigh
        return res
