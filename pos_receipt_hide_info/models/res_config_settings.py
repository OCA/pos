# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_hide_user = fields.Boolean(related="pos_config_id.hide_user", readonly=False)
    pos_hide_company_email = fields.Boolean(
        related="pos_config_id.hide_company_email", readonly=False
    )
    pos_hide_company_phone = fields.Boolean(
        related="pos_config_id.hide_company_phone", readonly=False
    )
