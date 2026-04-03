# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import api, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.model
    def _load_pos_data_fields(self, config_id) -> list:
        res = super()._load_pos_data_fields(config_id)
        if "ref" not in res:
            res.append("ref")
        return res
