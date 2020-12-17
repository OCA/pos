# Copyright 2018-20 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import models, fields


class PosConfig(models.Model):
    _inherit = "pos.config"

    passive_shopper_recognition = fields.Boolean(
        string="Enable Passive Shopper Recognition",
        help="Gain insights to grow your business.",
    )
    active_shopper_recognition = fields.Boolean(
        string="Enable Active Shopper Recognition",
        help="Engage recognized shoppers by personalizing their shopping experience.",
    )
