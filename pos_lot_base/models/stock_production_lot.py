# Copyright 2022 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
from odoo import fields, models


class StockProductionLot(models.Model):

    _inherit = "stock.production.lot"

    product_sale_ok = fields.Boolean(related="product_id.sale_ok")
    product_available_in_pos = fields.Boolean(related="product_id.available_in_pos")
    available_in_pos = fields.Boolean()
