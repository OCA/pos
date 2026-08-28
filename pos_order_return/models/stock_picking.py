# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
import logging

from odoo import api, models

_logger = logging.getLogger(__name__)


class StockPicking(models.Model):
    _inherit = "stock.picking"

    @api.model
    def _create_picking_from_pos_order_lines(
        self, location_dest_id, lines, picking_type, partner=False
    ):
        """Odoo bases return picking if the quantities are negative, but it's
        not linked to the original one"""
        pickings = self.env["stock.picking"]
        orders = lines.mapped("order_id")
        # Case of POS Setting: Update qty in stock `in real time`
        if len(orders) == 1 and orders.refunded_order_id.picking_ids:
            negative_lines = lines.filtered(
                lambda _l: _l.product_id.type == "consu" and _l.qty < 0
            )
            if negative_lines:
                # Create picking for return order
                returned_picking = self._create_return_picking_from_pos_order_lines(
                    negative_lines, orders.refunded_order_id.picking_ids
                )
                if returned_picking:
                    returned_picking.write(
                        {
                            "pos_session_id": orders.session_id.id,
                            "pos_order_id": orders.id,
                            "origin": orders.name,
                        }
                    )
                    pickings |= returned_picking
                    lines -= negative_lines

        # Case of POS Setting: Update qty in stock `At the session closing`
        pickings |= super()._create_picking_from_pos_order_lines(
            location_dest_id, lines, picking_type, partner
        )
        return pickings

    @api.model
    def _create_return_picking_from_pos_order_lines(self, order_lines, pickings):
        """
        Create picking for return order by using stock return wizard
        """
        wizard = self.env["stock.return.picking"].new(
            {
                "picking_id": pickings.filtered(
                    lambda picking: picking.location_dest_id.usage == "customer"
                ).id
            }
        )
        # Discard not returned lines
        wizard.product_return_moves.filtered(
            lambda x: x.product_id not in order_lines.mapped("product_id")
        ).unlink()

        # Sum return qty by product
        to_return = {}
        for order_line in order_lines:
            to_return.setdefault(order_line.product_id, 0)
            to_return[order_line.product_id] += abs(order_line.qty)

        # Update return qty of return wizard lines
        for move in wizard.product_return_moves:
            move.quantity = min(to_return[move.product_id], move.move_quantity)
            to_return[move.product_id] -= move.quantity

        picking = self.env["stock.picking"]
        # Avoid empty returns which will block the validation
        if any(wizard.product_return_moves.mapped("quantity")):
            picking = wizard._create_return()
            picking.move_ids._add_mls_related_to_order(order_lines, are_qties_done=True)
            picking.move_ids.picked = True
            self.env.flush_all()
            try:
                with self.env.cr.savepoint():
                    picking._action_done()
            except Exception as err:
                _logger.error(
                    "Validating the transfer '%s' failed: '%s'", picking.name, str(err)
                )
        return picking
