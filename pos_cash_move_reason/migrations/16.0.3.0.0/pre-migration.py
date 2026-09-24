from openupgradelib import openupgrade


@openupgrade.migrate()
def migrate(env, version):
    if openupgrade.column_exists(
        env.cr, "account_bank_statement_line", "pos_move_reason"
    ):
        openupgrade.rename_columns(
            env.cr,
            {
                "account_bank_statement_line": [
                    ("pos_move_reason", "pos_move_reason_id")
                ],
            },
        )
