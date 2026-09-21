# copyright 2023 Dinar Gabbasov
# Copyright 2023 Ooops404
# Copyright 2023 Cetmix
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_allow_edit_order_line = fields.Boolean(
        related="pos_config_id.allow_edit_order_line",
        readonly=False,
    )
