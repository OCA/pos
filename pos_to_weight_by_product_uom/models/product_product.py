# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class ProductProduct(models.Model):
    _inherit = "product.product"

    @api.onchange("uom_id", "uom_po_id")
    def _onchange_uom(self):
        res = super()._onchange_uom()
        if self.uom_id:
            self.to_weight = self.uom_id.category_id.to_weight
        return res
