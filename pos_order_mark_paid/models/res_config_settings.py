# Copyright 2026 Cetmix OÜ
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    # No "pos_" prefix: core writes every "pos_*" value to the matching
    # pos.config field (point_of_sale/models/res_config_settings.py:126-142).
    mark_paid_currency_id = fields.Many2one(
        related="pos_config_id.currency_id", string="Mark as Paid Currency"
    )
    pos_mark_paid_enabled = fields.Boolean(
        related="pos_config_id.mark_paid_enabled", readonly=False
    )
    pos_mark_paid_account_id = fields.Many2one(
        related="pos_config_id.mark_paid_account_id", readonly=False
    )
    pos_mark_paid_max_percent = fields.Float(
        related="pos_config_id.mark_paid_max_percent", readonly=False
    )
    pos_mark_paid_max_amount = fields.Monetary(
        related="pos_config_id.mark_paid_max_amount",
        currency_field="mark_paid_currency_id",
        readonly=False,
    )
    pos_mark_paid_label = fields.Char(
        related="pos_config_id.mark_paid_label", readonly=False
    )
