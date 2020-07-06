# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging

_logger = logging.getLogger(__name__)


def _create_column(cr, table_name, column_name, column_type):
    _logger.info("Fast creation of the column %s.%s" % (
        table_name, column_name))

    req = "ALTER TABLE %s ADD COLUMN %s %s" % (
        table_name, column_name, column_type)
    cr.execute(req)


def pre_init_hook(cr):
    _create_column(cr, 'pos_order_line', 'purchase_price', 'numeric')
    _create_column(cr, 'pos_order_line', 'margin', 'numeric')
    _create_column(cr, 'pos_order_line', 'margin_percent', 'numeric')
    _create_column(cr, 'pos_order', 'margin', 'numeric')
    _create_column(cr, 'pos_order', 'margin_percent', 'numeric')
