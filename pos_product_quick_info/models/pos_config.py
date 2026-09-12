from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    display_quick_product_info = fields.Boolean(default=True)
    display_product_locations = fields.Boolean(
        string="Display product locations in product info", default=True
    )
