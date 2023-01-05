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
        string="Quantity",
        required=True,
        default=1,
    )

    product_tmpl_combo_category_option_ids = fields.One2many(
        comodel_name="product.template.combo.category.option",
        inverse_name="product_tmpl_combo_category_id",
        string="Product Template Combo Category Option",
    )

    combo_category_option_behavior = fields.Selection(
        selection=[
            ("default", "Default"),
            ("duplicate_item", "Duplicate Item"),
        ],
        ondelete="set null",
        help="""
        [Default]: No type of exceptional behavior is defined, items will be\n
            added as they were registered, respecting the maximum and\n
            minimum values.
        [Duplicate Item]: Combo options with this category will have their\n
            product duplicated when added in order with value 0,01.
        """,
    )
