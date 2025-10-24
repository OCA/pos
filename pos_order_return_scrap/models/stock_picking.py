# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import api, models


class StockPicking(models.Model):
    _inherit = "stock.picking"

    @api.model
    def _create_picking_from_pos_order_lines(
        self, location_dest_id, lines, picking_type, partner=False
    ):
        """
        Override this method to create scrap orders for lines which is_scrap = True
        """
        pickings = super()._create_picking_from_pos_order_lines(
            location_dest_id, lines, picking_type, partner
        )
        if not pickings:
            return pickings

        # Scrap the negative lines (returned lines) only
        to_scrap_lines = lines.filtered(
            lambda _l: _l.product_id.type == "consu" and _l.qty < 0 and _l.is_scrap
        )
        if to_scrap_lines:
            self._create_scraps_from_pos_order_lines(to_scrap_lines, pickings)
        return pickings

    @api.model
    def _create_scraps_from_pos_order_lines(self, order_lines, pickings):
        """
        Create scrap orders for pos lines in both cases of stock qty updating: at real
        time and at session closing
        """
        scraps = self.env["stock.scrap"]
        move_lines = pickings.mapped("move_line_ids").filtered(
            lambda m: m.state == "done" and m.move_id._is_incoming()
        )
        if not move_lines:
            return scraps
        # Sum return qty by product
        to_scrap = {}
        for order_line in order_lines:
            to_scrap.setdefault(order_line.product_id, 0)
            to_scrap[order_line.product_id] += abs(order_line.qty)

        StockScrap = self.env["stock.scrap"].sudo()
        for product, qty in to_scrap.items():
            for move_line in move_lines:
                if qty <= 0:
                    break
                if product != move_line.product_id:
                    continue
                scrap_qty = min(move_line.quantity_product_uom, qty)
                qty -= scrap_qty
                vals = StockScrap.default_get(StockScrap._fields.keys())
                vals.update(
                    {
                        "product_id": product.id,
                        "picking_id": move_line.picking_id.id,
                        "scrap_qty": scrap_qty,
                    }
                )
                new_record = StockScrap.new(vals)
                # To trigger the onchange _onchange_serial_number if possible
                if move_line.lot_id:
                    new_record.lot_id = move_line.lot_id
                vals = StockScrap._convert_to_write(new_record._cache)
                scrap = StockScrap.create(vals)
                # Validate the scrap order if enough stock
                scrap.action_validate()
                scraps |= scrap
        return scraps
