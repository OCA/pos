# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo import api, fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_config_logo = fields.Image(related="pos_config_id.logo", readonly=False)
    has_pos_config_logo = fields.Boolean(
        help="Use an alternative logo for this store",
        compute="_compute_has_pos_config_logo",
        inverse="_inverse_has_pos_config_logo",
    )

    @api.depends("pos_config_id")
    def _compute_has_pos_config_logo(self):
        for config in self:
            config.has_pos_config_logo = bool(config.pos_config_logo)

    def _inverse_has_pos_config_logo(self):
        for config in self:
            if not config.has_pos_config_logo:
                config.pos_config_logo = False
