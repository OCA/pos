# Copyright 2022 Odoo
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosPaymentMethod(models.Model):

    _inherit = "pos.payment.method"

    journal_id = fields.Many2one(
        "account.journal",
        string="Journal",
        domain=[("is_cash_count", "=", "True")],
        ondelete="restrict",
        help="Leave empty to use the receivable account of customer.\n"
        "Defines the journal where to book the accumulated payments "
        + "(or individual payment if Identify Customer is true) after closing "
        + "the session.\n"
        "For cash journal, we directly write to the default account in the "
        + "journal via statement lines.\n"
        "For bank journal, we write to the outstanding account specified in "
        + "this payment method.\n"
        "Only cash and bank journals are allowed.",
    )

    outstanding_account_id = fields.Many2one(
        "account.account",
        string="Outstanding Account",
        ondelete="restrict",
        help="Leave empty to use the default account from the company setting.\n"
        "Account used as outstanding account when creating accounting "
        + "payment records for bank payments.",
    )
