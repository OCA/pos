# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_max_meal_voucher_amount = fields.Monetary(
        related="pos_config_id.max_meal_voucher_amount",
        readonly=False,
    )
    pos_enable_meal_voucher_order_lines_icon = fields.Boolean(
        related="pos_config_id.enable_meal_voucher_order_lines_icon",
        readonly=False,
    )
    pos_enable_meal_voucher_receipt_info = fields.Boolean(
        related="pos_config_id.enable_meal_voucher_receipt_info",
        readonly=False,
    )
