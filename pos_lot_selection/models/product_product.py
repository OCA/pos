# Copyright 2022 Camptocamp SA
# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)

from odoo import api, fields, models
from odoo.tools import float_compare


class ProductProduct(models.Model):
    _inherit = "product.product"

    available_lot_for_pos_ids = fields.Json(
        compute="_compute_available_lot_for_pos", prefetch=False
    )

    @api.depends()
    @api.depends_context("company")
    def _compute_available_lot_for_pos(self):
        for record in self:
            record.available_lot_for_pos_ids = record.get_available_lots_for_pos(
                self.env.company.id
            )

    def get_available_lots_for_pos(self, company_id):
        self.ensure_one()
        if self.type != "product" or self.tracking == "none":
            return []
        lots = (
            self.env["stock.lot"]
            .sudo()
            .search(
                [
                    "&",
                    ["product_id", "=", self.id],
                    "|",
                    ["company_id", "=", company_id],
                    ["company_id", "=", False],
                ]
            )
        )

        lots = lots.filtered(
            lambda lot: float_compare(
                lot.product_qty, 0, precision_digits=lot.product_uom_id.rounding
            )
            > 0
        )
        return [lot._get_pos_info() for lot in lots]
