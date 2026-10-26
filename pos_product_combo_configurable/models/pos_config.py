# Copyright 2026 Acysos S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    view_combo_product_image = fields.Boolean(
        default=True,
        help="View image of combo product in popup",
    )
