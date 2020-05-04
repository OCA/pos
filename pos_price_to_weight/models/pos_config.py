# Copyright 2020 Coop IT Easy - Manuel Claeys Bouuaert
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    pos_price_to_weight_price_field_id = fields.Many2one(
        string="Price To Weight Field",
        comodel_name="ir.model.fields",
        domain=[("model", "=", "product.product"), ("ttype", "=", "float")],
        required=True,
        default=lambda x: x._default_pos_price_to_weight_price_field_id(),
    )

    pos_price_to_weight_price_field_name = fields.Char(
        related="pos_price_to_weight_price_field_id.name")

    def _default_pos_price_to_weight_price_field_id(self):
        return self.env.ref("product.field_product_product__list_price")
