# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    product_restrict_qty_available_location = fields.Boolean(
        string="Only display products which are available in the "
        "default source location of the picking type.",
    )
    product_restrict_qty_available_location_ids = fields.Many2many(
        comodel_name="stock.location",
        string="Select additional locations.",
    )
