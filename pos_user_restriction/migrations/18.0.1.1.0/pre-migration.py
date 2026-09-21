# Copyright 2026 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from openupgradelib import openupgrade

_noupdate_xmlids = [
    "pos_config_assigned_users",
    "pos_session_assigned_users",
    "pos_order_assigned_users",
    "pos_order_report_assigned_users",
    "pos_config_see_all",
    "pos_session_see_all",
    "pos_order_see_all",
    "pos_order_report_see_all",
]


@openupgrade.migrate()
def migrate(cr, version):
    # Workaround to execute the migration script without errors
    # see https://github.com/odoo/odoo/blob/2a839ef1ed09c36f27ce7536ca3052d9f65ceed9/odoo/modules/migration.py#L252-L256
    env = cr
    openupgrade.set_xml_ids_noupdate_value(
        env, "pos_user_restriction", _noupdate_xmlids, False
    )
