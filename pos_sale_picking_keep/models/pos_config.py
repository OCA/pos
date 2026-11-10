# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    keep_picking = fields.Boolean(
        help="When loading sale orders in POS, Odoo cancels the sale pickings."
        "Change the strategy here.",
    )
