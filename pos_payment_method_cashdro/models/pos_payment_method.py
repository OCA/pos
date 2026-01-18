# Copyright 2021 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import fields, models


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    def _get_payment_terminal_selection(self):
        return super()._get_payment_terminal_selection() + [("cashdro", "Cashdro")]

    cashdro_host = fields.Char(
        string="Cashdro Terminal Host Name or IP address",
        help="It must be reachable by the PoS in the store",
    )
    cashdro_user = fields.Char()
    cashdro_password = fields.Char()

    def _onchange_journal_id(self):
        """Cash payment method force the `use_payment_terminal` to `False` as
        it's assumed that a cash journal can't have a payment terminal. Let's keep
        the method when it's needed"""
        res = super()._onchange_journal_id()
        if self.use_payment_terminal != "cashdro" and not self.is_cash_count:
            return res
        self.use_payment_terminal = "cashdro"

    def _compute_hide_use_payment_terminal(self):
        """Now that we have the option to choose a payment terminal for the cashdro
        payments, we can show the terminal options for cash payment types."""
        cash_payment_types = self.filtered(lambda x: x.type == "cash")
        cash_payment_types.hide_use_payment_terminal = False
        return super(
            PosPaymentMethod, self - cash_payment_types
        )._compute_hide_use_payment_terminal()
