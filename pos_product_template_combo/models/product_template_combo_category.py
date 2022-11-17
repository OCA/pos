# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ProductTemplateComboCategory(models.Model):

    _name = "product.template.combo.category"
    _description = "Combo category for product template"

    name = fields.Char(
        string="Name",
        required=True,
    )

    sequence = fields.Integer(
        string="Sequence",
        default=1,
    )

    price = fields.Float(
        string="Price",
        required=True,
    )

    max_qty = fields.Integer(
        string="Max Qty",
        required=True,
        default=1,
    )

    product_tmpl_combo_category_option_ids = fields.One2many(
        comodel_name="product.template.combo.category.option",
        inverse_name="product_tmpl_combo_category_id",
        string="Product Template Combo Category Option",
    )
