# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosSessionCurrencyBalance(models.Model):
    _name = "pos.session.currency.balance"
    _description = "POS Session Currency Balance"
    _order = "session_id, payment_method_id, currency_id"

    session_id = fields.Many2one(
        comodel_name="pos.session",
        required=True,
        ondelete="cascade",
        index=True,
    )
    payment_method_id = fields.Many2one(
        comodel_name="pos.payment.method",
        required=True,
    )
    currency_id = fields.Many2one(
        comodel_name="res.currency",
        required=True,
    )
    company_id = fields.Many2one(related="session_id.company_id")
    balance_start = fields.Monetary(
        string="Opening Balance",
        currency_field="currency_id",
    )
    balance_end_real = fields.Monetary(
        string="Closing Balance",
        currency_field="currency_id",
    )
    difference_move_id = fields.Many2one(
        comodel_name="account.move",
        string="Difference Journal Entry",
        readonly=True,
    )
    tender_amount = fields.Monetary(
        compute="_compute_amounts",
        currency_field="currency_id",
    )
    expected_balance = fields.Monetary(
        compute="_compute_amounts",
        currency_field="currency_id",
    )
    difference_balance = fields.Monetary(
        compute="_compute_amounts",
        currency_field="currency_id",
    )

    _sql_constraints = [
        (
            "session_method_currency_uniq",
            "unique(session_id, payment_method_id, currency_id)",
            "A session already has a balance for this payment method and currency.",
        )
    ]

    @api.depends(
        "balance_end_real",
        "session_id.order_ids.payment_ids.amount_currency",
        "session_id.order_ids.payment_ids.foreign_currency_id",
        "session_id.statement_line_ids.amount_currency",
        "session_id.statement_line_ids.foreign_currency_id",
    )
    def _compute_amounts(self):
        """Fill tendered, expected and difference amounts for each balance row."""
        for balance in self:
            session = balance.session_id
            currency = balance.currency_id
            method = balance.payment_method_id
            tender = session._foreign_tender_amount(method, currency)
            if method.type == "cash":
                expected = session._foreign_cash_expected(currency)
            else:
                expected = tender
            balance.tender_amount = tender
            balance.expected_balance = expected
            balance.difference_balance = currency.round(
                balance.balance_end_real - expected
            )
