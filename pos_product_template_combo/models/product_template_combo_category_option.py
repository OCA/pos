# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ProductTemplateComboCategoryOption(models.Model):

    _name = "product.template.combo.category.option"
    _description = "Combo category option for product template"

    name = fields.Char(
        string="Name",
        required=True,
    )

    product_tmpl_combo_category_id = fields.Many2one(
        comodel_name="product.template.combo.category",
        string="Product Tmpl Combo Category",
    )

    product_template_id = fields.Many2one(
        comodel_name="product.template",
        string="Product Template",
        required=True,
        domain="[('available_in_pos', '=', True)]",
    )
