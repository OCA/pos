# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    sales_report_by_category_only = fields.Boolean(
        string="Sales Report by Category only?", default=True
    )
