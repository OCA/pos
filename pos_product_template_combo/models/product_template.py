# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class ProductTemplate(models.Model):

    _inherit = "product.template"

    is_combo = fields.Boolean("Is Combo")

    product_tmpl_combo_category_ids = fields.Many2many(
        comodel_name="product.template.combo.category",
        string="Product Tmpl Combo Category",
    )

    @api.onchange("is_combo")
    def _onchange_invoice_list(self):
        if self.is_combo:
            self.list_price = 0
