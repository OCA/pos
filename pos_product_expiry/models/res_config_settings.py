# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_check_lot_expiry = fields.Boolean(
        related="pos_config_id.check_lot_expiry", readonly=False
    )
