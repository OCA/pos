# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Quentin DUPONT <quentin.dupont@grap.coop>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import api, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    @api.onchange("uom_id")
    def _onchange_uom_id(self):
        res = super()._onchange_uom_id()
        if self.uom_id:
            self.to_weight = self.uom_id.category_id.to_weight
        return res

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if "uom_id" in vals and "to_weight" not in vals:
                uom = self.env["uom.uom"].browse(vals["uom_id"])
                vals["to_weight"] = uom.category_id.to_weight
        return super().create(vals_list)

    def write(self, vals):
        if "uom_id" in vals and "to_weight" not in vals:
            uom = self.env["uom.uom"].browse(vals["uom_id"])
            vals["to_weight"] = uom.category_id.to_weight
        return super().write(vals)
