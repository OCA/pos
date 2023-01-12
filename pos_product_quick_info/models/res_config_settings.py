from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_display_quick_product_info = fields.Boolean(
        related="pos_config_id.display_quick_product_info", readonly=False
    )
