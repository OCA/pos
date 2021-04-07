# Copyright 2021 Sunflower IT
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    use_deposit = fields.Boolean("Use Deposit")
    is_deposit = fields.Boolean("Is Deposit")
    select_deposit = fields.Many2one(
        "product.product", "Select Deposit", domain=[("is_deposit", "!=", False)]
    )
