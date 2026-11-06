# Copyright 2026 Aurestic (https://www.aurestic.es) - Antonio Valdés
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class LoyaltyProgram(models.Model):
    _inherit = "loyalty.program"

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields = super()._load_pos_data_fields(config_id)
        if "duration_days" not in fields:
            fields.append("duration_days")
        return fields
