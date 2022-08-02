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
    cashdro_user = fields.Char(string="Cashdro User")
    cashdro_password = fields.Char(string="Cashdro Password")

    def _onchange_is_cash_count(self):
        if self.use_payment_terminal == "cashdro":
            return
        return super()._onchange_is_cash_count()
