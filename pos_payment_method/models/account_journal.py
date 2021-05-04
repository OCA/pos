# Copyright 2018-21 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class AccountJournal(models.Model):
    _inherit = "account.journal"

    def _get_payment_terminal_selection(self):
        return []

    use_payment_terminal = fields.Selection(
        selection=lambda self: self._get_payment_terminal_selection(),
        string="Use a Payment Terminal",
        help="Record payments with a terminal on this journal."
    )
    hide_use_payment_terminal = fields.Boolean(
        compute="_compute_hide_use_payment_terminal",
        help="Technical field which is used to hide pos_payment_terminal "
             "when no payment interfaces are installed."
    )

    def _compute_hide_use_payment_terminal(self):
        no_terminals = not bool(
            self._fields["use_payment_terminal"].selection(self))
        for journal in self:
            journal.hide_use_payment_terminal = (
                no_terminals or journal.type == "cash"
            )

    @api.onchange('use_payment_terminal')
    def _onchange_use_payment_terminal(self):
        return
