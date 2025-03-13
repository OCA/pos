# Copyright 2025 Moka
# @author Damien Horvat <damien@moka.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models

class PosConfig(models.Model):
    _inherit = "pos.config"

    def get_model_names(self):
        result = super().get_model_names()
        return result + ["event.event", "event.event.ticket", "event.tag"]
