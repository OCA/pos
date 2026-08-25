# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    check_lot_expiry = fields.Boolean(default=True)
