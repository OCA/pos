# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    res_partner_required_fields_ids = fields.Many2many(
        "ir.model.fields",
        string="Partner required fields",
        domain=[("model", "=", "res.partner")],
        help=(
            "List of fields that are required while creating "
            "or updating a res partner from the point of sale."
        ),
    )
    res_partner_required_fields_names = fields.Char(
        string="Partner required fields name",
        compute="_compute_res_partner_required_fields_names",
        help="Technical fields to avoid adding ir.model.fields in pos model",
    )

    @api.depends("res_partner_required_fields_ids")
    def _compute_res_partner_required_fields_names(self):
        for config in self:
            config.res_partner_required_fields_names = ",".join(
                config.res_partner_required_fields_ids.mapped("name")
            )
