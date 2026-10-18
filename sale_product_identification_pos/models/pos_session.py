"""Extend POS session payload for identification enforcement."""

# Copyright 2025 Binhex <https://www.binhex.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models
from odoo.tools import str2bool


class PosSession(models.Model):
    _inherit = "pos.session"

    enforce_partner_identification = fields.Boolean(
        compute="_compute_enforce_partner_identification",
        readonly=True,
    )

    def _compute_enforce_partner_identification(self):
        icp = self.env["ir.config_parameter"].sudo()
        param_value = icp.get_param(
            "sale_product_identification_pos.enforce_partner_identification",
            default="False",
        )
        enforce_identification = bool(str2bool(str(param_value)))
        for session in self:
            session.enforce_partner_identification = enforce_identification

    @api.model
    def _load_pos_data_models(self, config_id):
        models = super()._load_pos_data_models(config_id)
        models += ["res.partner.id_category", "product.template.id_category"]
        return models

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields_list = super()._load_pos_data_fields(config_id)
        if "enforce_partner_identification" not in fields_list:
            fields_list.append("enforce_partner_identification")
        return fields_list
