# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# Copyright 2026 CHEF PIXEL
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging

from odoo import models

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _process_order(self, order, draft):
        order_id = super()._process_order(order, draft)
        if order_id:
            pos_order = self.browse(order_id)
            pos_order._add_surplus_product_if_needed()
        return order_id

    def _add_surplus_product_if_needed(self):
        for order in self:
            surplus = 0
            if order.payment_ids:
                payment_methods = order.payment_ids.mapped("payment_method_id")
                cp_list = set(payment_methods.mapped("change_policy"))
                for payment in order.payment_ids:
                    if (
                        payment.amount < 0
                        and len(cp_list) > 1
                        and payment.payment_method_id.change_policy == "cash"
                    ):
                        payment.unlink()
                        continue
                    surplus = order.amount_return
                    if surplus <= 0:
                        continue
                    profit_payment = order.payment_ids.filtered(
                        lambda p: p.payment_method_id.change_policy == "profit_product"
                    )[:1]
                    if not profit_payment:
                        continue
                    payment_method = profit_payment.payment_method_id
                    product = payment_method.change_product_id
                    if len(cp_list) == 1:
                        change_amount = -surplus
                    else:
                        change_amount = surplus
                        self.env["pos.order.line"].create(
                            {
                                "order_id": order.id,
                                "product_id": product.id,
                                "full_product_name": product.display_name,
                                "qty": 1,
                                "price_unit": change_amount,
                                "price_subtotal": change_amount,
                                "price_subtotal_incl": change_amount,
                            }
                        )
            if len(cp_list) > 1:
                order.amount_total = order.amount_paid + change_amount
                order.amount_paid = order.amount_paid + change_amount
