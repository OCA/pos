# Copyright 2025 Binhex - Adasat Torres de León.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    iface_sale_order_allow_commitment_date = fields.Boolean(
        related="pos_config_id.iface_sale_order_allow_commitment_date",
        readonly=False,
    )
