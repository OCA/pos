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

    def _compute_total_cost(self, stock_moves):
        """
        Compute the total cost of the order lines.
        :param stock_moves: recordset of `stock.move`, used for fifo/avco lines
        """
        for line in self.filtered(lambda l: not l.is_total_cost_computed):
            product = line.product_id
            if line._is_product_storable_fifo_avco() and stock_moves:
                product_cost = product._compute_average_price(
                    0,
                    line.qty,
                    stock_moves.filtered(lambda ml: ml.product_id == product),
                )
            else:
                product_cost = product.standard_price
            line.total_cost = line.qty * product.cost_currency_id._convert(
                from_amount=product_cost,
                to_currency=line.currency_id,
                company=line.company_id or self.env.company,
                date=line.order_id.date_order or fields.Date.today(),
                round=False,
            )
            line.is_total_cost_computed = True

    @api.depends("lines.is_total_cost_computed")
    def _compute_is_total_cost_computed(self):
        for order in self:
            order.is_total_cost_computed = not False not in order.lines.mapped(
                "is_total_cost_computed"
            )
