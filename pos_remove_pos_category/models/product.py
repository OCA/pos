# Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    pos_categ_id = fields.Many2one(
        "product.category",
        store=False,
        related="categ_id",
        search="_search_pos_categ_id",
    )

    def _search_pos_categ_id(self, operator, value):
        return [("categ_id", operator, value)]

    @api.model
    def create(self, vals):
        if "categ_id" in vals:
            vals["pos_categ_id"] = vals["categ_id"]
        return super().create(vals)

    def write(self, vals):
        if "pos_categ_id" in vals and not vals["pos_categ_id"]:
            del vals["pos_categ_id"]
        return super().write(vals)


class ProductCategory(models.Model):
    _inherit = "product.category"

    image_128 = fields.Image("Image", max_width=128, max_height=128)

    available_in_pos = fields.Boolean(
        string="Available in the Point of Sale",
        default=True,
        help="Check if you want this category to appear in Point Of Sale.\n"
        "If you uncheck, children categories will becomes invisible too, "
        "whatever their checkbox state.",
    )
