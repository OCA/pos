# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    meal_voucher_ok = fields.Boolean(
        string="Meal Voucher",
        help="Check this box if the product can be paid with meal vouchers."
    )

    @api.onchange("categ_id")
    def onchange_categ_id_pos_meal_voucher(self):
        for template in self:
            template.meal_voucher_ok = template.categ_id.meal_voucher_ok

    @api.model
    def create(self, vals):
        if "meal_voucher_ok" not in vals and "categ_id" in vals:
            # Guess meal_voucher_ok if not present, based on the category
            categ = self.env["product.category"].browse(vals.get("categ_id"))
            vals["meal_voucher_ok"] = categ.meal_voucher_ok
        return super().create(vals)
