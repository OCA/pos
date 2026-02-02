# Copyright 2022 Camptocamp SA
# Copyright 2024 Dixmit
# Copyright 2025 Nathan Kirui
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)

from odoo import models


class StockLot(models.Model):
    _inherit = "stock.lot"

    def _get_pos_info(self, location_id=None):
        """
        Get lot information for POS display.

        :param location_id: If provided, includes the available quantity
            at that location
        :return: Dictionary with lot information
        """
        # Call parent method to get base lot info
        result = super()._get_pos_info()

        # If location is specified, include the available quantity
        # at that location
        if location_id:
            quants = (
                self.env["stock.quant"]
                .sudo()
                .search(
                    [
                        ("lot_id", "=", self.id),
                        ("location_id", "child_of", location_id),
                    ]
                )
            )
            available_qty = sum(quants.mapped("quantity"))
            result["quantity"] = available_qty
        else:
            # Fallback to total product_qty if no location specified
            result["quantity"] = self.product_qty

        return result
