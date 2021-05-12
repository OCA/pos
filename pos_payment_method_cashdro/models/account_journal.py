# Copyright 2021 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import fields, models


class AccountJournal(models.Model):
    _inherit = "account.journal"
    # TODO: In 13.0 this fields should be moved to `pos.payment.method`
    # and be addod to the payment terminal selection

    cashdro_payment_terminal = fields.Boolean()
    cashdro_host = fields.Char(
        string="Cashdro Terminal Host Name or IP address",
        help="It must be reachable by the PoS in the store",
    )
    cashdro_user = fields.Char(string="Cashdro User")
    cashdro_password = fields.Char(string="Cashdro Password")
