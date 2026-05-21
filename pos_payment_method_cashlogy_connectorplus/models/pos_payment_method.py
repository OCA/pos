# Copyright 2026 Tecnativa - David Bañón
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosPaymentMethod(models.Model):
    _inherit = ["pos.payment.method", "pos.load.mixin"]
    _name = "pos.payment.method"

    def _get_payment_terminal_selection(self):
        return super()._get_payment_terminal_selection() + [("cashlogy", "cashlogy")]

    @api.model
    def _load_pos_data_fields(self, config_id):
        res = super()._load_pos_data_fields(config_id)
        return res + ["cashlogy_url", "cashlogy_api_key"]

    cashlogy_url = fields.Char(
        string="Cashlogy Terminal URL",
        help=(
            "Must be reachable by the PoS in the store"
            " and contain no trailing slash (/)"
        ),
    )

    cashlogy_api_key = fields.Char(
        string="Cashlogy API key",
        help="Api key to authenticate with Cashogy ConnectorPlus",
    )

    def _onchange_journal_id(self):
        """Cash payment method force the `use_payment_terminal` to `False` as
        it's assumed that a cash journal can't have a payment terminal. Let's keep
        the method when it's needed"""
        res = super()._onchange_journal_id()
        if self.use_payment_terminal != "cashlogy" and not self.is_cash_count:
            return res
        self.use_payment_terminal = "cashlogy"

    def _compute_hide_use_payment_terminal(self):
        """Now that we have the option to choose a payment terminal for the cashlogy
        payments, we can show the terminal options for cash payment types."""
        cash_payment_types = self.filtered(lambda x: x.type == "cash")
        cash_payment_types.hide_use_payment_terminal = False
        return super(
            PosPaymentMethod, self - cash_payment_types
        )._compute_hide_use_payment_terminal()
