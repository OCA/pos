# Copyright 2025 Tecnativa - Pedro M. Baeza
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import api, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def sync_from_ui(self, orders):
        # Avoid the cancellation of the SO pickings
        so_line_ids = []
        for order_data in orders:
            for command in order_data.get("lines", []):
                if len(command) != 3:
                    continue  # No create/update command
                so_line_id = command[2].get("sale_order_line_id")
                if so_line_id:
                    so_line_ids.append(so_line_id)
        so_lines = self.env["sale.order.line"].browse(so_line_ids)
        # confirm the unconfirmed sale orders that are linked to the sale order lines
        # this is done also upstream, but we need to do it first for having already
        # the pickings to make the trick
        sale_orders = so_lines.order_id
        for sale_order in sale_orders.filtered(lambda x: x.state in ["draft", "sent"]):
            sale_order.action_confirm()
        # Fake the pickings state before calling super for avoiding the move quantity
        # reduction that is done upstream that effectively cancels the SO pickings
        pickings = so_lines.move_ids.picking_id
        state_field = self.env["stock.picking"]._fields["state"]
        picking_values = {}
        # Save picking state values
        for picking in pickings:
            picking_values[picking.id] = picking.state
        # Don't mark the concerned pickings state as dirty to avoid
        # unwanted recomputations
        with self.env.protecting([state_field], pickings):
            pickings.state = "draft"
            res = super().sync_from_ui(orders)
            for picking in pickings:
                picking.state = picking_values[picking.id]
        return res
