# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Quentin DUPONT <quentin.dupont@grap.coop>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import api, models


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    @api.onchange('uom_id')
    def _onchange_uom_id(self):
        res = super(ProductTemplate, self)._onchange_uom_id()
        if self.uom_id:
            self.to_weight = self.uom_id.to_weigh
        return res
