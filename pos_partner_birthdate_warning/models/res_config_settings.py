# Copyright 2025 Invitu SARL
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    age_warning = fields.Integer(
        related="company_id.age_warning",
        readonly=False,
        help="Choose the age max for the warning",
    )
