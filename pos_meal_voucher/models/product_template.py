# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    meal_voucher_ok = fields.Boolean(
        string="Can be Paid for by Meal Vouchers",
        help="Check this box if the product can be paid for by meal vouchers.",
    )

    @api.onchange("categ_id")
    def onchange_categ_id_pos_meal_voucher(self):
        for template in self:
            template.meal_voucher_ok = template.categ_id.meal_voucher_ok

    @api.model_create_multi
    def create(self, vals_list):
        product_category_model = self.env["product.category"]
        for vals in vals_list:
            if "meal_voucher_ok" not in vals and "categ_id" in vals:
                # Guess meal_voucher_ok if not present, based on the category
                categ = product_category_model.browse(vals.get("categ_id"))
                vals["meal_voucher_ok"] = categ.meal_voucher_ok
        return super().create(vals_list)
