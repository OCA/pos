# Copyright (C) 2026 - Today: GRAP (http://www.grap.coop)
# @author: Quentin DUPONT
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
import logging

from openupgradelib import openupgrade

_logger = logging.getLogger(__name__)


@openupgrade.migrate()
def migrate(env, version):
    _logger.info("Set pos move reason in account_bank_statement_line.")
    openupgrade.logged_query(
        env.cr,
        """
        UPDATE account_bank_statement_line absl
        SET pos_move_reason = pmr.id
        FROM pos_move_reason pmr
        WHERE pmr.name = absl.payment_ref;
    """,
    )
