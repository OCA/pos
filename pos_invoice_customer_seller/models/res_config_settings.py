# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    set_seller_invoice = fields.Boolean(
        related="pos_config_id.set_seller_invoice", readonly=False
    )
