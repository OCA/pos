from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_allow_reorder = fields.Boolean(
        related="pos_config_id.allow_reorder", readonly=False
    )
