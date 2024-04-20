# Copyright 2024 Dixmit (https://www.dixmit.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosSession(models.Model):
    _inherit = "product.product"

    template_variants = fields.Integer(compute="_compute_template_variants")
    template_name = fields.Char(compute="_compute_template_name")

    @api.depends()
    def _compute_template_name(self):
        for record in self:
            record.template_name = record.product_tmpl_id.display_name

    @api.depends()
    def _compute_template_variants(self):
        for record in self:
            record.template_variants = len(record.product_tmpl_id.product_variant_ids)
