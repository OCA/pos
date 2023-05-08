# Copyright 2022 Odoo
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosOrder(models.Model):

    _inherit = "pos.order"

    is_total_cost_computed = fields.Boolean(
        compute="_compute_is_total_cost_computed",
        help="Allows to know if all the total cost of the order lines have "
        + "already been computed",
    )

    def _compute_total_cost_at_session_closing(self, stock_moves):
        """
        Compute the margin at the end of the session. This method should be
        called to compute the remaining lines margin
        containing a storable product with a fifo/avco cost method and then
        compute the order margin
        """
        for order in self:
            storable_fifo_avco_lines = order.lines.filtered(
                lambda l: l._is_product_storable_fifo_avco()
            )
            storable_fifo_avco_lines._compute_total_cost(stock_moves)

    @api.depends("lines.is_total_cost_computed")
    def _compute_is_total_cost_computed(self):
        for order in self:
            order.is_total_cost_computed = not False not in order.lines.mapped(
                "is_total_cost_computed"
            )
