# Copyright 2022 Camptocamp SA
# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)

from odoo import models


class StockLot(models.Model):
    _inherit = "stock.lot"

    def _get_pos_info(self):
        # We will add this as a hook to add more fields if necessary
        return {
            "id": self.id,
            "name": self.name,
        }
