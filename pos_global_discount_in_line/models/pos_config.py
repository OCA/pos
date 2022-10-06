from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    global_discount_in_line = fields.Boolean(string="Add Discount in Line")
