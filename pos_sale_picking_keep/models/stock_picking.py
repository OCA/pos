# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from collections import defaultdict

from odoo import _, api, models
from odoo.exceptions import UserError
from odoo.tools import float_compare


class StockPicking(models.Model):
    _inherit = "stock.picking"

    def _create_sale_order_return_pickings_from_pos_lines(self, lines):
        """Create return pickings from the original sale order deliveries.

        Return lines linked to sale order lines must use the original
        delivery picking to preserve the sale order line relationship.
        """
        moves_by_picking = defaultdict(list)
        for line in lines:
            sol = line.refunded_orderline_id.sale_order_line_id
            outgoing_moves, _incoming_moves = sol._get_outgoing_incoming_moves()
            delivery_moves = outgoing_moves.filtered(lambda move: move.state == "done")
            if not delivery_moves:
                continue
            # Partial deliveries are not supported by this implementation.
            if len(delivery_moves) > 1:
                raise UserError(
                    _(
                        "Multiple completed deliveries were found for sale "
                        "order line '%s'. The return cannot be processed "
                        "automatically.",
                        sol.display_name,
                    )
                )
            move = delivery_moves
            # Convert the requested quantity to the sale order line UoM,
            # which is also the UoM used by qty_delivered.
            qty = line.product_uom_id._compute_quantity(
                -line.qty,
                sol.product_uom,
                round=False,
            )
            available_qty = sol.qty_delivered
            rounding = sol.product_uom.rounding
            if float_compare(available_qty, 0, precision_rounding=rounding) <= 0:
                continue
            if float_compare(qty, available_qty, precision_rounding=rounding) > 0:
                raise UserError(
                    _(
                        "You cannot return %(requested)s units of '%(product)s'. "
                        "Only %(available)s units can still be returned.",
                        requested=qty,
                        product=sol.product_id.display_name,
                        available=available_qty,
                    )
                )
            picking = move.picking_id
            # The return wizard expects the quantity in the stock move UoM.
            move_qty = line.product_uom_id._compute_quantity(
                -line.qty,
                move.product_uom,
                round=False,
            )
            moves_by_picking[picking.id].append((move, move_qty))
        return_pickings = self.env["stock.picking"]
        for picking_id, move_quantities in moves_by_picking.items():
            wizard = (
                self.env["stock.return.picking"]
                .with_context(
                    active_model="stock.picking",
                    active_id=picking_id,
                )
                .create({})
            )
            for move, quantity in move_quantities:
                wizard.product_return_moves.filtered(
                    lambda return_line, move=move: return_line.move_id == move
                ).quantity = quantity
            return_picking = wizard._create_return()
            return_picking.button_validate()
            return_pickings |= return_picking
        return return_pickings

    @api.model
    def _create_picking_from_pos_order_lines(
        self, location_dest_id, lines, picking_type, partner=False
    ):
        """
        Avoid cancelling existing pickings and re-launching stock rules from
        POS line if linked to a sale order line and with a strategy
        to keep sale pickings.
        """
        sale_order_lines = lines.filtered(lambda line: line.sale_order_line_id)
        # Handle refunds linked to sale order lines through their original POS lines.
        refund_lines = (lines - sale_order_lines).filtered(
            lambda line: line.refunded_orderline_id.sale_order_line_id
        )
        return_pickings = self._create_sale_order_return_pickings_from_pos_lines(
            refund_lines
        )
        pos_pickings = super()._create_picking_from_pos_order_lines(
            location_dest_id=location_dest_id,
            lines=(lines - sale_order_lines - refund_lines),
            picking_type=picking_type,
            partner=partner,
        )
        return return_pickings | pos_pickings
