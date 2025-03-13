# Copyright 2025 Moka
# @author Damien Horvat <damien@moka.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models

class PosSession(models.Model):
    _inherit = "pos.session"

    def _pos_ui_models_to_load(self):
        
        models = super()._pos_ui_models_to_load()
        models.extend(
            [
                "event.event",
                "event.event.ticket"
                "event.tag",
            ]
        )
        return models

    @api.model
    def _load_pos_data_models(self, config_id):
       """Load the data to the pos.config.models"""

       data = super()._load_pos_data_models(config_id)
       data += ["event.event", "event.event.ticket", "event.tag"]
       return data
