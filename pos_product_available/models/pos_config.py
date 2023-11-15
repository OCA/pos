from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"
    _description = "Point of Sale Config Visible Products"

    available_product = fields.Boolean()
    available_product_ids = fields.Many2many(
        comodel_name="product.template",
        string="Available Products",
    )
    