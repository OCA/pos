# Copyright 2023 FactorLibre - Juan Carlos Bonilla
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_display_default_code = fields.Boolean(
        related="pos_config_id.display_default_code", readonly=False
    )
