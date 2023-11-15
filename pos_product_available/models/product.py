from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"
    _description = "Point of Sale Visible Product"
    
    pos_center_ids = fields.Many2many(
        comodel_name="pos.config",
        string="PdV Visibles",
    )