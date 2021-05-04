# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class AccountBankStatement(models.Model):
    _inherit = "account.bank.statement"

    @api.multi
    def _get_opening_balance(self, journal_id):
        PosSession = self.env["pos.session"]
        pos_config_id = self.env.context.get("pos_config_id")
        if pos_config_id:
            sessions = PosSession.search(
                [('config_id', '=', pos_config_id)],
                order="start_at desc", limit=1)
            if not sessions:
                # it is the first time the pos config is opened.
                # returning 0
                return 0
            else:
                last_valid_statement = False
                for old_statement in sessions.mapped('statement_ids'):
                    if old_statement.journal_id.id == journal_id:
                        last_valid_statement = old_statement
                if last_valid_statement:
                    return last_valid_statement.balance_end_real

        return super()._get_opening_balance(journal_id)
