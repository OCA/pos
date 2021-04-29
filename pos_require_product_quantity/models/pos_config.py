from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    require_product_quantity = fields.Boolean(
        string="Require product quantity in POS",
        default=False,
    )
