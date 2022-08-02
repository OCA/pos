# Copyright 2022 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from openupgradelib import openupgrade


def move_cashdro_fields_to_new_model(env):
    openupgrade.logged_query(
        env.cr,
        """
        ALTER TABLE pos_payment_method
            ADD COLUMN cashdro_host varchar,
            ADD COLUMN cashdro_user varchar,
            ADD COLUMN cashdro_password varchar
        """,
    )
    openupgrade.logged_query(
        env.cr,
        """
        UPDATE pos_payment_method ppm SET
            cashdro_host = aj.cashdro_host,
            cashdro_user = aj.cashdro_user,
            cashdro_password = aj.cashdro_password,
            use_payment_terminal = 'cashdro'
        FROM (
            SELECT * FROM account_journal
        ) AS aj
        WHERE ppm.name = aj.name AND aj.cashdro_payment_terminal
        """,
    )


@openupgrade.migrate()
def migrate(env, version):
    move_cashdro_fields_to_new_model(env)
