# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_always_enable_order_settle = fields.Boolean(
        related="pos_config_id.always_enable_order_settle", readonly=False
    )
