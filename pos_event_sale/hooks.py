# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import logging

from odoo import SUPERUSER_ID, api
from odoo.tools.sql import column_exists, create_column

_logger = logging.getLogger(__name__)


def pre_init_hook(cr):
    """Store currency_id in database for each existing pos_order_line"""
    if not column_exists(cr, "pos_order_line", "currency_id"):
        _logger.info("Pre-computing pos.order.line.currency_id..")
        create_column(cr, "pos_order_line", "currency_id", "int4")
        cr.execute(
            """
            WITH pos_order_line_currency AS (
                SELECT
                    pol.id AS id,
                    COALESCE(aj.currency_id, rc.currency_id) AS currency_id
                FROM pos_order_line         AS pol
                JOIN pos_order              AS po   ON pol.order_id = po.id
                JOIN pos_session            AS ps   ON po.session_id = ps.id
                JOIN pos_config             AS pc   ON ps.config_id = pc.id
                JOIN res_company            AS rc   ON pc.company_id = rc.id
                LEFT JOIN account_journal   AS aj   ON pc.journal_id = aj.id
            )
            UPDATE pos_order_line
            SET currency_id = pos_order_line_currency.currency_id
            FROM pos_order_line_currency
            WHERE pos_order_line.id = pos_order_line_currency.id
            """
        )


def post_init_hook(cr, __):
    """Set the Event Registration product available for POS"""
    env = api.Environment(cr, SUPERUSER_ID, {})
    product = env.ref("event_sale.product_product_event", raise_if_not_found=False)
    if product:
        _logger.info("Setting default Event Product as available in Point of Sale..")
        product.available_in_pos = True
