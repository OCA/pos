# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import api, models


class StockPicking(models.Model):
    _inherit = "stock.picking"

    @api.model
    def _create_picking_from_pos_order_lines(
        self, location_dest_id, lines, picking_type, partner=False
    ):
        """
        Avoid cancelling existing pickings and re-launching stock rules from
        POS line if linked to a sale order line and with a strategy
        to keep sale pickings.
        """
        lines_without_create = lines.filtered(
            lambda line: line.sale_order_line_id
            and line.order_id.config_id.keep_picking
        )
        return super()._create_picking_from_pos_order_lines(
            location_dest_id=location_dest_id,
            lines=(lines - lines_without_create),
            picking_type=picking_type,
            partner=partner,
        )
