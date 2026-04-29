# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class ResPartner(models.Model):
    _inherit = "res.partner"

    def _load_pos_data_fields(self, config_id):
        fields = super()._load_pos_data_fields(config_id)
        fields.append("birthdate_date")
        return fields
