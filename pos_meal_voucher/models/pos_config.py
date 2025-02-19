# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    max_meal_voucher_amount = fields.Monetary(
        string="Meal Voucher Maximum Amount",
        currency_field="currency_id",
    )
    enable_meal_voucher_order_lines_icon = fields.Boolean(
        string="Meal Voucher Icon on Order Lines", default=True
    )
    enable_meal_voucher_receipt_info = fields.Boolean(
        string="Meal Voucher Information on Receipt",
    )
    has_meal_voucher_payment_method = fields.Boolean(
        compute="_compute_has_meal_voucher_payment_method"
    )

    def _compute_has_meal_voucher_payment_method(self):
        for config in self:
            config.has_meal_voucher_payment_method = bool(
                config.payment_method_ids.filtered(
                    lambda x: x.meal_voucher_type is not False
                )
            )
