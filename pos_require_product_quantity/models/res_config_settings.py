# Copyright 2025 CoopITEasy - Simon Hick <sim@coopiteasy.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_require_product_quantity = fields.Boolean(
        related="pos_config_id.require_product_quantity",
        readonly=False,
    )
