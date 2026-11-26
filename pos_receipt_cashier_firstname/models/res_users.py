# Copyright 2026 INVITU (https://www.invitu.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class ResUsers(models.Model):
    _inherit = "res.users"

    @api.model
    def _load_pos_data_fields(self, config_id):
        res = super()._load_pos_data_fields(config_id)
        res.append("firstname")
        return res
