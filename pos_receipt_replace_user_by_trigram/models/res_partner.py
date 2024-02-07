# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models

from .. import utils


class ResPartner(models.Model):
    _inherit = "res.partner"

    pos_trigram = fields.Char(compute="_compute_pos_trigram")

    @api.depends("firstname", "lastname")
    def _compute_pos_trigram(self):
        for partner in self:
            partner.pos_trigram = utils.get_trigram(partner.firstname, partner.lastname)
