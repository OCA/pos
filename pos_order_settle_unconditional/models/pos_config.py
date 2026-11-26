# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    always_enable_order_settle = fields.Boolean(
        default=True,
        help="List also sale orders totalling a negative amount in the "
        "Quotation/Order dialog, so that they can be settled from the POS.",
    )
