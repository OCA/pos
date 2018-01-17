# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging

_logger = logging.getLogger(__name__)


def _create_column(cr, table_name, column_name, column_type):
    req = "ALTER TABLE %s ADD COLUMN %s %s" % (
        table_name, column_name, column_type)
    cr.execute(req)


def pre_init_hook(cr):
    _logger.info("Compute pos_order_line.purchase_price for existing lines")
    _create_column(cr, 'pos_order_line', 'purchase_price', 'numeric')
    cr.execute("""
        UPDATE pos_order_line
            SET purchase_price = line_standard_price.standard_price
        FROM (
            SELECT
                pol.id line_id,
                (SELECT cost
                    FROM product_price_history pph
                    WHERE
                        pph.datetime <= po.date_order
                        AND pph.product_template_id = pp.product_tmpl_id
                        AND pph.company_id = pol.company_id
                    ORDER BY datetime desc
                    LIMIT 1) standard_price
            FROM pos_order_line pol
            INNER JOIN pos_order po
                ON po.id = pol.order_id
            INNER JOIN product_product pp
                ON pp.id = pol.product_id
            ) line_standard_price
        WHERE
            pos_order_line.id = line_standard_price.line_id;
        """)

    _logger.info("Fast Compute pos_order_line fields: margin, margin_percent")
    _create_column(cr, 'pos_order_line', 'margin', 'numeric')
    _create_column(cr, 'pos_order_line', 'margin_percent', 'numeric')
    cr.execute("""
        UPDATE pos_order_line
        SET
            margin = price_subtotal - (purchase_price * qty),
            margin_percent = CASE
                WHEN price_subtotal = 0 then 0
                ELSE 100 * (price_subtotal - (purchase_price * qty))
                    / price_subtotal
                END;
        """)

    _logger.info("Fast Compute pos_order fields: margin, margin_percent")
    _create_column(cr, 'pos_order', 'margin', 'numeric')
    _create_column(cr, 'pos_order', 'margin_percent', 'numeric')
    cr.execute("""
        UPDATE pos_order po
            SET
                margin = order_margin.margin,
                margin_percent = order_margin.margin_percent
        FROM (
            SELECT
                po.id order_id,
                sum(pol.margin) margin,
                CASE
                    WHEN sum(pol.price_subtotal) = 0 THEN 0
                    ELSE sum(pol.margin) / sum(pol.price_subtotal) * 100
                    END margin_percent
            FROM pos_order po
            INNER JOIN pos_order_line pol
                ON pol.order_id = po.id group by po.id
        ) order_margin
        WHERE po.id = order_margin.order_id;
        """)
