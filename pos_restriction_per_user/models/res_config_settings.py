# Copyright 2026 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_config_restrict_user_ids = fields.Many2many(
        related="pos_config_id.restrict_user_ids", readonly=False
    )
