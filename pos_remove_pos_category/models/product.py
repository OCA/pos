# Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    pos_categ_ids = fields.Many2many(
        "product.category",
        store=False,
        compute="_compute_pos_categ_ids",
        search="_search_pos_categ_ids",
    )

    def _compute_pos_categ_ids(self):
        for product in self:
            if product.categ_id and product.categ_id.available_in_pos:
                product.pos_categ_ids = [(6, 0, [product.categ_id.id])]
            else:
                product.pos_categ_ids = False

    def _search_pos_categ_ids(self, operator, value):
        return [("categ_id", operator, value)]

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if "categ_id" in vals:
                vals["pos_categ_ids"] = [(6, 0, [vals["categ_id"]])]
        return super().create(vals_list)

    def write(self, vals):
        if "pos_categ_ids" in vals and not vals["pos_categ_ids"]:
            del vals["pos_categ_ids"]
        return super().write(vals)


class ProductCategory(models.Model):
    _inherit = "product.category"

    image_128 = fields.Image(max_width=128, max_height=128)

    available_in_pos = fields.Boolean(
        string="Available in the Point of Sale",
        default=True,
        help="Check if you want this category to appear in Point Of Sale.\n"
        "If you uncheck, children categories will becomes invisible too, "
        "whatever their checkbox state.",
    )
