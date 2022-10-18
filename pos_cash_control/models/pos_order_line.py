# Copyright 2022 Odoo
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrderLine(models.Model):

    _inherit = "pos.order.line"

    is_total_cost_computed = fields.Boolean(
        help="Allows to know if the total cost has already been computed or not"
    )

    def _is_product_storable_fifo_avco(self):
        self.ensure_one()
        return self.product_id.type == "product" and self.product_id.cost_method in [
            "fifo",
            "average",
        ]

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
