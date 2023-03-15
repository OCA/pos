# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):

    _inherit = "pos.config"

    scrap_source_location_id = fields.Many2one(
        comodel_name="stock.location",
        string="Scrap Source Location",
        domain="[('usage', '=', 'internal'), ('company_id', 'in', [company_id, False])]",
        check_company=True,
    )

    scrap_location_id = fields.Many2one(
        comodel_name="stock.location",
        string="Scrap Location",
        domain="[('scrap_location', '=', True), ('company_id', 'in', [company_id, False])]",
        check_company=True,
    )
