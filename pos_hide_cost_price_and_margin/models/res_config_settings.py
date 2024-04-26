# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_is_margins_costs_accessible_to_admin = fields.Boolean(
        related="pos_config_id.is_margins_costs_accessible_to_admin", readonly=False
    )
