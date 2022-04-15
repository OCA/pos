# Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, SUPERUSER_ID
import logging
logger = logging.getLogger(__name__)


def set_margin_on_pos_invoices(cr, registry):
    logger.info(
        "Define purchase prices on invoice lines"
        " created from Point of Sale. This could take a while ..."
    )

    with api.Environment.manage():
        env = api.Environment(cr, SUPERUSER_ID, {})
        orders = env["pos.order"].search([
            ("margin_percent", "!=", 100),
            ("state", "=", "invoiced")]
        )

        count = 1
        total_count = len(orders)
        for order in orders:
            logger.info(
                "{count}/{total_count}: Compute margin for"
                " invoice related to {order_name}".format(
                    count=count,
                    total_count=total_count,
                    order_name=order.name
                )
            )

            invoice = order.invoice_id
            for invoice_line in invoice.invoice_line_ids:
                # Try to get the related order_line
                order_lines = order.lines.filtered(
                    lambda x: x.product_id == invoice_line.product_id
                )
                if order_lines:
                    invoice_line.purchase_price = order_lines[0].purchase_price
            count += 1
