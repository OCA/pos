# Copyright 2026 Acysos S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class ProductComboPack(models.Model):
    _name = "product.combo.pack"
    _description = "POS Product Combo Pack Line"
    _order = "sequence, id"

    sequence = fields.Integer(default=10)
    product_tmpl_id = fields.Many2one(
        comodel_name="product.template",
        string="Combo Product",
        required=True,
        ondelete="cascade",
        index=True,
    )
    is_required = fields.Boolean(
        string="Required Products",
        default=False,
        help="Selected products are required for the combo.",
    )
    include_price = fields.Boolean(
        string="Include in Main Product Price",
        default=False,
        help=(
            "If enabled, the price of these sub-products is included "
            "in the main combo product price."
        ),
    )
    include_all_products = fields.Boolean(
        string="Include all Products",
        default=False,
        help=(
            "Automatically include all POS-available products "
            "from the selected POS category."
        ),
    )
    pos_category_id = fields.Many2one(
        comodel_name="pos.category",
        string="Category",
        required=True,
    )
    product_ids = fields.Many2many(
        comodel_name="product.product",
        relation="product_combo_pack_product_rel",
        column1="combo_pack_id",
        column2="product_id",
        string="Product",
        domain=(
            "[('available_in_pos', '=', True), "
            "('pos_categ_id', '=', pos_category_id), "
            "('is_combo', '=', False)]"
        ),
        required=True,
    )
    default_qty = fields.Integer(
        string="Default Quantity",
        default=1,
        required=True,
    )
    no_of_items = fields.Integer(
        string="No. of Items",
        default=1,
        required=True,
        help=(
            "Number of products that can be selected "
            "on the POS screen for this category."
        ),
    )

    @api.onchange("pos_category_id", "include_all_products")
    def _onchange_pos_category_include_all(self):
        for record in self:
            if not record.pos_category_id:
                record.product_ids = [(5, 0, 0)]
                continue
            if record.include_all_products:
                products = self.env["product.product"].search(
                    [
                        ("available_in_pos", "=", True),
                        ("pos_categ_id", "=", record.pos_category_id.id),
                        ("is_combo", "=", False),
                    ]
                )
                record.product_ids = [(6, 0, products.ids)]
            else:
                category = record.pos_category_id
                valid_products = record.product_ids.filtered(
                    lambda p, categ=category: p.pos_categ_id == categ
                )
                record.product_ids = [(6, 0, valid_products.ids)]

    @api.constrains("default_qty", "no_of_items", "product_ids")
    def _check_quantities_and_items(self):
        for record in self:
            if record.default_qty < 1:
                raise ValidationError(_("Default Quantity must be at least 1."))
            if record.no_of_items < 1:
                raise ValidationError(_("Number of Items must be at least 1."))
            if record.product_ids and record.no_of_items > len(record.product_ids):
                raise ValidationError(
                    _(
                        "The number of items (%(no_of_items)s) cannot exceed "
                        "the number of configured products (%(num_products)s) "
                        "in category '%(category)s'.",
                        no_of_items=record.no_of_items,
                        num_products=len(record.product_ids),
                        category=record.pos_category_id.display_name,
                    )
                )
