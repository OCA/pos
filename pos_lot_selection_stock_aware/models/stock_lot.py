# Copyright 2022 Camptocamp SA
# Copyright 2024 Dixmit
# Copyright 2025 Nathan Kirui
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)

from odoo import models


class StockLot(models.Model):
    _inherit = "stock.lot"

    def _get_location_quantity(self, location_id):
        """
        Get available quantity for this lot at a specific location.

        :param location_id: Location ID to check quantity
        :return: Available quantity at location
        """
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
        return sum(quants.mapped("quantity"))
