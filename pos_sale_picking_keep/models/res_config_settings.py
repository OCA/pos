# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_picking_keep_strategy = fields.Selection(
        related="pos_config_id.picking_keep_strategy",
        readonly=False,
    )
