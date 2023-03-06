from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_global_discount_in_line = fields.Boolean(
        related="pos_config_id.global_discount_in_line",
        readonly=False,
    )
