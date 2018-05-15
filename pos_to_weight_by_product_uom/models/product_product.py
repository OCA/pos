# coding: utf-8
# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, models


class ProductProduct(models.Model):
    _inherit = 'product.product'

    @api.multi
    def onchange_uom(self, uom_id, uom_po_id):
        res = super(ProductProduct, self).onchange_uom(uom_id, uom_po_id)
        if uom_id:
            res = res or {}
            val = res.setdefault('value', {})
            val['to_weight'] = self.env['product.uom'].browse(uom_id).to_weigh
        return res
