# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_config_product_restrict_qty_available_location = fields.Boolean(
        related="pos_config_id.product_restrict_qty_available_location",
        readonly=False,
    )
    pos_config_product_restrict_qty_available_location_ids = fields.Many2many(
        related="pos_config_id.product_restrict_qty_available_location_ids",
        readonly=False,
    )
