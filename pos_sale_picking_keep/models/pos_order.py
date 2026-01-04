# Copyright 2025 Tecnativa - Pedro M. Baeza
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import api, models
from odoo.tools import config


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def sync_from_ui(self, orders):
        # Avoid the cancellation of the SO pickings
        so_line_ids = []
        for order_data in orders:
            lines_data = order_data.get("lines", [])
            for _, _, line_data in lines_data:
                so_line_id = line_data.get("sale_order_line_id")
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
        pickings.state = "draft"
        res = super().sync_from_ui(orders)
        pickings._compute_state()
        return res

    def _create_order_picking(self):
        # Nullify the creation of the pickings at this level
        # We cannot use self.env.context.get("test_pos_sale_picking_keep") because
        # the tours that run in the tests do not allow that context to be maintained.
        # Therefore, we use self.config_id.name.
        if (
            config["test_enable"]
            and self.config_id.name != "test_pos_sale_picking_keep"
        ):
            # For not breaking tests of other modules
            return super()._create_order_picking()
        return True
