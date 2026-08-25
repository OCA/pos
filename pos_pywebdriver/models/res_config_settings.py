# Copyright 2026 Open Source Integrators
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_use_pywebdriver = fields.Boolean(
        related="pos_config_id.use_pywebdriver",
        readonly=False,
    )
    pos_pywebdriver_ip = fields.Char(
        related="pos_config_id.pywebdriver_ip",
        readonly=False,
    )
