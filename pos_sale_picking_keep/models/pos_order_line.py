# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    def _launch_stock_rule_from_pos_order_lines(self):
        """
        Launch stock rules for pos order lines that are not linked to a sale order line
        """
        lines_to_launch = self.filtered(lambda line: not line.sale_order_line_id)
        if lines_to_launch:
            super(
                PosOrderLine, lines_to_launch
            )._launch_stock_rule_from_pos_order_lines()
        return True
