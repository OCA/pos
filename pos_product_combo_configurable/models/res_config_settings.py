# Copyright 2026 Acysos S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_view_combo_product_image = fields.Boolean(
        related="pos_config_id.view_combo_product_image",
        readonly=False,
        string="View Combo Product Image",
    )
