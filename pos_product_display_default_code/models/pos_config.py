# Copyright 2023 FactorLibre - Juan Carlos Bonilla
from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    display_default_code = fields.Boolean(default=False)

    def _load_pos_data_read(self, records, config):
        result = super()._load_pos_data_read(records, config)
        for pos_config in result:
            pos_config["display_default_code"] = config.display_default_code
        return result
