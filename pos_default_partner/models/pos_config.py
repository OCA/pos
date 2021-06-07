# Copyright 2020 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):

    _inherit = "pos.config"

    default_partner_id = fields.Many2one(
        comodel_name="res.partner",
        string="Default Customer",
    )
