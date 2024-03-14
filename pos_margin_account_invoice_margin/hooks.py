# Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging

from odoo import SUPERUSER_ID, api

logger = logging.getLogger(__name__)


def set_margin_on_pos_invoices(cr, registry):
    logger.info(
        "Define purchase prices on invoice lines"
        " created from Point of Sale. This could take a while ..."
    )
    env = api.Environment(cr, SUPERUSER_ID, {})

    orders = env["pos.order"].search([("state", "=", "invoiced")])

    count = 1
    for order in orders:
        if order.margin_percent == 100:
            count += 1
            continue
        logger.info(
            f"{count}/{len(orders)}: Compute margin for"
            f" invoice related to {order.name}"
        )

        invoice = order.account_move
        for invoice_line in invoice.line_ids.filtered(lambda x: x.product_id):
            # Try to get the related order_line
            order_lines = order.lines.filtered(
                lambda x: x.product_id == invoice_line.product_id
            )
            if order_lines:
                invoice_line.purchase_price = (
                    order_lines[0].total_cost / order_lines[0].qty
                )
        count += 1
