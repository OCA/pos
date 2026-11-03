# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_currency_id = fields.Many2one(related="pos_config_id.currency_id")
    pos_company_currency_id = fields.Many2one(related="company_id.currency_id")
    pos_foreign_currency_ids = fields.Many2many(
        related="pos_config_id.foreign_currency_ids",
        readonly=False,
        domain="[('id', '!=', pos_currency_id), ('id', '!=', pos_company_currency_id)]",
    )
