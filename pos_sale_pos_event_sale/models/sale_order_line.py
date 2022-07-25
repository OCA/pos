# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    def read_converted(self):
        # OVERRIDE to read also the event fields
        res = super().read_converted()
        product_lines = self.filtered(lambda rec: rec.product_type)
        product_items = [item for item in res if item.get("product_id")]
        for line, item in zip(product_lines, product_items):
            item.update(line._read_format(["event_id", "event_ticket_id"])[0])
        return res
