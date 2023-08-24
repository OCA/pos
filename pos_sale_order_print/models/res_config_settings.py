# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_sale_order_print_ids = fields.Many2many(
        "ir.actions.report",
        related="pos_config_id.print_sales_order_ids",
        readonly=False,
    )
