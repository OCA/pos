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

    def read_converted(self):
        results = super().read_converted()
        lines = {line.id: line for line in self}
        for item in results:
            line = lines.get(item.get("id"))
            if not line or line.product_id.type == "service":
                continue
            product_uom = line.product_id.uom_id
            if product_uom == line.product_uom_id:
                continue
            # The PoS charges product_uom_qty - qty_invoiced (see the JS
            # override of setQuantityFromSOL) and rounds it with the Product
            # Unit precision. When the quantity converted to the product UoM
            # is not representable with that precision (e.g. 4 Units of a
            # pack of 150 = 0.0267 packs, rounded to 0.03 by the PoS), the
            # rounding would change the charged amount. Compensate on the
            # price so rounded qty * price matches the sale order line
            # remaining amount.
            qty = item["product_uom_qty"] - item["qty_invoiced"]
            qty_rounded = product_uom.round(qty)
            if product_uom.is_zero(qty_rounded):
                continue
            item["price_unit"] = item["price_unit"] * qty / qty_rounded
        return results
