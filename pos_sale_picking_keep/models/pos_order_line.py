# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    def _launch_stock_rule_from_pos_order_lines(self):
        """
        Launch stock rules for pos order lines that are not linked to a sale order
        line and when the strategy is to keep both pos and sale order pickings
        """
        lines_to_launch = self.filtered(
            lambda line: not line.order_id.pos_config.picking_keep_strategy
            or (
                line.order_id.pos_config.picking_keep_strategy
                == "keep_sale_pos_pickings"
                and not line.sale_order_line_id
            )
        )
        if lines_to_launch:
            super(
                PosOrderLine, lines_to_launch
            )._launch_stock_rule_from_pos_order_lines()
        return True
