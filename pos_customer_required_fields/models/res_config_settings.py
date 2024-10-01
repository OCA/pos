# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_res_partner_required_fields_ids = fields.Many2many(
        related="pos_config_id.res_partner_required_fields_ids",
        string="Partner required fields",
        readonly=False,
    )
    pos_res_partner_required_fields_names = fields.Char(
        related="pos_config_id.res_partner_required_fields_names",
        string="Partner required fields names",
        readonly=False,
    )
