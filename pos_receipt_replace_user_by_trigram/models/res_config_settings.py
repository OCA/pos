# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_replace_user_by_trigram = fields.Boolean(
        related="pos_config_id.replace_user_by_trigram", readonly=False
    )
