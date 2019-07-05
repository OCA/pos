# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging

_logger = logging.getLogger(__name__)


def _create_column(cr, table_name, column_name, column_type):
    # pylint: disable=sql-injection
    req = "ALTER TABLE %s ADD COLUMN %s %s" % (
        table_name, column_name, column_type)
    cr.execute(req)


def pre_init_hook(cr):
    _logger.info(
        "Compute stock_picking.partner_name for existing pickings")
    _create_column(cr, 'stock_picking', 'partner_name', 'VARCHAR')
    cr.execute("""
        UPDATE stock_picking sp
        SET partner_name = rp.name
        FROM res_partner rp
        WHERE sp.partner_id = rp.id;
        """)
