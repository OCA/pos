# Copyright 2022 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)

from odoo import api, models
from odoo.tools import float_compare


class ProductionLot(models.Model):
    _inherit = "stock.production.lot"

    @api.model
    def get_available_lots_for_pos(self, product_id, company_id):
        lots = self.sudo().search(
            [
                "&",
                ["product_id", "=", product_id],
                "|",
                ["company_id", "=", company_id],
                ["company_id", "=", False],
            ]
        )

        lots = lots.filtered(
            lambda l: float_compare(
                l.product_qty, 0, precision_rounding=l.product_uom_id.rounding
            )
            > 0
        )

        return lots.mapped("name")
