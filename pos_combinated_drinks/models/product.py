# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import models, fields, api, _


class ProductTemplate(models.Model):
    _inherit = "product.template"

    is_combo = fields.Boolean("Is Combo")
    combo_price = fields.Float('Combo price', company_dependent=True, digits='Product Price', groups="base.group_user")
    combo_category_ids = fields.Many2many('pos.category', string='Pos Categories')

    product_combo_ids = fields.One2many('product.combo', 'product_tmpl_id')


class ProductCombo(models.Model):
    _name = 'product.combo'
    _description = 'Product Combo'

    product_tmpl_id = fields.Many2one('product.template')


