# Copyright 2022 Odoo
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosPaymentMethod(models.Model):

    _inherit = "pos.payment.method"

    outstanding_account_id = fields.Many2one(
        "account.account",
        string="Outstanding Account",
        ondelete="restrict",
        help="Leave empty to use the default account from the company setting.\n"
        "Account used as outstanding account when creating accounting payment \n"
        "records for bank payments.",
    )
    journal_id = fields.Many2one(
        "account.journal",
        string="Journal",
        domain=[("type", "in", ("cash", "bank"))],
        ondelete="restrict",
        help="Leave empty to use the receivable account of customer.\n"
        "Defines the journal where to book the accumulated payments (or \n"
        "individual payment if Identify Customer is true) after closing the session.\n"
        "For cash journal, we directly write to the default account in the \n"
        "journal via statement lines.\n"
        "For bank journal, we write to the outstanding account specified in \n"
        "this payment method.\n"
        "Only cash and bank journals are allowed.",
    )
    type = fields.Selection(
        selection=[
            ("cash", "Cash"),
            ("bank", "Bank"),
            ("pay_later", "Customer Account"),
        ],
        compute="_compute_type",
    )

    @api.depends("journal_id", "split_transactions")
    def _compute_type(self):
        for pm in self:
            if pm.journal_id.type in {"cash", "bank"}:
                pm.type = pm.journal_id.type
            else:
                pm.type = "pay_later"

    @api.depends("type")
    def _compute_is_cash_count(self):
        for pm in self:
            pm.is_cash_count = pm.type == "cash"
