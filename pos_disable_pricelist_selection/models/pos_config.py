from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    hide_pricelist_button = fields.Boolean(
        default=False,
    )
