# Copyright 2025 Binhex - Adasat Torres de León.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_sale_order_allow_commitment_date = fields.Boolean(default=True)
