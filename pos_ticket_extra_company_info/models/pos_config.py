# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    ticket_address = fields.Char(compute="_compute_ticket_address")

    def _compute_ticket_address(self):
        for config in self:
            config.ticket_address = config.company_id.partner_id.with_context(
                show_address_only=True,
                html_format=True,
            )._get_name()
