# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    logo = fields.Binary()

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields = list(super()._load_pos_data_fields(config_id) or self._fields)
        return list(dict.fromkeys([*fields, "logo"]))
