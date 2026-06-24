# Copyright 2026 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import api, models


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    # TODO: Delete if merged https://github.com/odoo/odoo/pull/253333
    def _compute_qty_delivered(self):
        self = self.with_context(from_qty_delivered=True)
        return super()._compute_qty_delivered()

    # TODO: Delete if merged https://github.com/odoo/odoo/pull/253333
    @api.model
    def _convert_qty(self, sale_line, qty, direction):
        if self.env.context.get("from_qty_delivered"):
            return 0
        return super()._convert_qty(sale_line=sale_line, qty=qty, direction=direction)
