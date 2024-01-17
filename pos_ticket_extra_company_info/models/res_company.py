# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

    pos_ticket_address = fields.Char(compute="_compute_pos_ticket_address")

    def _compute_pos_ticket_address(self):
        for company in self:
            company.pos_ticket_address = company.partner_id.with_context(
                show_address_only=True,
            )._get_name()
