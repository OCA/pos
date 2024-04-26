# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    is_margins_costs_accessible_to_admin = fields.Boolean(
        string="Margins & Costs (Admin)",
        default=False,
    )
    is_margins_costs_accessible_to_every_user = fields.Boolean(
        compute="_compute_is_margins_costs_accessible_to_every_user",
        readonly=False,
        store=True,
    )

    @api.depends("is_margins_costs_accessible_to_admin")
    def _compute_is_margins_costs_accessible_to_every_user(self):
        for rec in self:
            if not rec.is_margins_costs_accessible_to_admin:
                rec.is_margins_costs_accessible_to_every_user = False
