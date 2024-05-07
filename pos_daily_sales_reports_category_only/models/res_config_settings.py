# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_sales_report_by_category_only = fields.Boolean(
        related="pos_config_id.sales_report_by_category_only", readonly=False
    )
