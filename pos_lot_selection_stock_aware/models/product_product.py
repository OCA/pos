# Copyright 2022 Camptocamp SA
# Copyright 2024 Dixmit
# Copyright 2025 Nathan Kirui
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

    def get_available_lots_for_pos(self, company_id, location_id=None):
        """
        Get available lots for a product in POS.

        :param company_id: Company ID
        :param location_id: Optional POS stock location ID for filtering
        :return: List of lot information dictionaries with quantities
        """
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

        # If location is specified, filter by location-specific quantity
        if location_id:
            available_lots = []
            for lot in lots:
                # Get quants for this lot at EXACTLY this location
                # Using "=" instead of "child_of" for precise filtering
                quants = (
                    self.env["stock.quant"]
                    .sudo()
                    .search(
                        [
                            ("lot_id", "=", lot.id),
                            ("location_id", "=", location_id),
                            ("quantity", ">", 0),
                        ]
                    )
                )
                available_qty = sum(quants.mapped("quantity"))

                # Only include lots with quantity > 0 at this location
                rounding = lot.product_uom_id.rounding
                if float_compare(available_qty, 0, rounding) > 0:
                    available_lots.append(lot._get_pos_info(location_id))

            return available_lots
        else:
            # Fallback to company-wide filtering (backward compatibility)
            lots = lots.filtered(
                lambda lot: float_compare(
                    lot.product_qty, 0, precision_digits=lot.product_uom_id.rounding
                )
                > 0
            )
            return [lot._get_pos_info() for lot in lots]
