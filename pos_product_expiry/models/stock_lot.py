# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import pytz

from odoo import models


class StockLot(models.Model):
    _inherit = "stock.lot"

    def _get_pos_info(self):
        result = super()._get_pos_info()
        if self.expiration_date:
            timezone = pytz.timezone(
                self._context.get("tz") or self.env.user.tz or "UTC"
            )
            result["expiration_date"] = self.expiration_date.astimezone(
                timezone
            ).isoformat()
        return result
