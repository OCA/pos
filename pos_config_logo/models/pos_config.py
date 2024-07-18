# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    logo = fields.Binary()
