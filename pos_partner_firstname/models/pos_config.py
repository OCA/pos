# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    partner_names_order = fields.Char(compute="_compute_partner_names_order")

    @api.depends()
    def _compute_partner_names_order(self):
        order = self.env["res.partner"]._get_names_order()
        for record in self:
            record.partner_names_order = order
