# Copyright 2017-2019 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    available_in_pos = fields.Boolean(
        string="Available for POS",
        default=False,
    )

    @api.model
    def create_from_ui(self, partner):
        partner.setdefault("available_in_pos", True)
        return super().create_from_ui(partner)
