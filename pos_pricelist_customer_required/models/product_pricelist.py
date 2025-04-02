# Copyright 2020 Akretion (https://www.akretion.com).
# @author Raphaël Reverdy <raphael.reverdy@akretion.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ProductPricelist(models.Model):
    _inherit = "product.pricelist"

    pos_require_customer = fields.Boolean(default=True)
