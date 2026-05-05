# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    picking_keep_strategy = fields.Selection(
        selection=[
            ("keep_sale_pickings", "Keep Sale Pickings Only"),
            ("keep_sale_pos_pickings", "Keep Sale and POS Pickings"),
        ],
        help="When loading sale orders in POS, Odoo cancels the sale pickings."
        "Change the strategy here.",
    )
