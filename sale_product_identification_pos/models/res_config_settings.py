# Copyright 2025 Binhex <https://www.binhex.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    enforce_pos_partner_identification = fields.Boolean(
        string="Enforce customer identification in POS",
        config_parameter="sale_product_identification_pos.enforce_partner_identification",
        help=(
            "When enabled, POS payments always require system-backed "
            "customer identification checks, even without a customer "
            "selected on the order."
        ),
    )
