# Copyright 2023 Akretion (http://www.akretion.com).
# @author Florian Mounier <florian.mounier@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosSession(models.Model):
    _inherit = "pos.session"

    cash_register_statement_line_ids = fields.One2many(
        "account.bank.statement.line",
        compute="_compute_cash_register_statement_line_ids",
        string="Cash Register Statement Lines",
    )

    cash_register_total_in = fields.Monetary(
        compute="_compute_cash_register_totals",
        string="Total Cash In",
    )
    cash_register_total_out = fields.Monetary(
        compute="_compute_cash_register_totals",
        string="Total Cash Out",
    )
    cash_real_total_in = fields.Monetary(
        string="Cash In",
        readonly=True,
    )
    cash_real_total_out = fields.Monetary(
        string="Cash Out",
        readonly=True,
    )

    total_cash_payments = fields.Monetary(
        compute="_compute_total_cash_payment",
        string="Total Payments",
    )

    total_real_cash_payments = fields.Monetary(
        compute="_compute_total_real_cash_payment",
        string="Total Real Payments",
    )

    # We can't use cashbox_start since it's unused in pos, so we get last session end
    previous_session_cash_box_end_id = fields.Many2one(
        "account.bank.statement.cashbox",
        compute="_compute_previous_session_cash_box_end_id",
        string="Previous Session Cash Box End",
    )
    previous_session_cash_box_end_line_ids = fields.One2many(
        related="previous_session_cash_box_end_id.cashbox_lines_ids",
        string="Previous Session Cash Box End Lines",
    )

    cash_box_end_id = fields.Many2one(
        related="cash_register_id.cashbox_end_id",
        string="Cash Box End",
    )
    cash_box_end_line_ids = fields.One2many(
        related="cash_box_end_id.cashbox_lines_ids",
        string="Cash Box End Lines",
    )

    def _get_cash_register_counterpart_account(self):
        # The cash in/out lines are in the move lines of the cash register
        # attached to the suspense account

        return self.cash_register_id.journal_id.suspense_account_id

    @api.depends("config_id")
    def _compute_previous_session_cash_box_end_id(self):
        for record in self:
            previous_session = self.search(
                [
                    ("config_id", "=", record.config_id.id),
                    ("state", "=", "closed"),
                    ("rescue", "=", False),
                    ("id", "<", record.id),
                ],
                order="id desc",
                limit=1,
            )
            record.previous_session_cash_box_end_id = previous_session.cash_box_end_id

    @api.depends("cash_register_id.line_ids")
    def _compute_cash_register_statement_line_ids(self):
        for session in self:
            # Here we can't list all cash_register_id.line_ids because if the
            # session is closed we also have the closure lines.
            # We need to filter these out using the account.account
            cash_register_account_id = session._get_cash_register_counterpart_account()

            session.cash_register_statement_line_ids = (
                session.cash_register_id.line_ids.filtered(
                    lambda line: line.move_id.line_ids.filtered(
                        lambda line: line.account_id == cash_register_account_id
                    )
                )
            )

    @api.depends("cash_register_id.line_ids")
    def _compute_cash_register_totals(self):
        for session in self:
            # When the cash register is opened, the cash in/out lines are the
            # cash register lines.
            session.cash_register_total_in = sum(
                [
                    line.amount
                    for line in session.cash_register_id.line_ids
                    if line.amount > 0
                ]
            )
            session.cash_register_total_out = sum(
                [
                    line.amount
                    for line in session.cash_register_id.line_ids
                    if line.amount < 0
                ]
            )

    @api.depends(
        "cash_register_total_entry_encoding",
        "cash_register_total_in",
        "cash_register_total_out",
    )
    def _compute_total_cash_payment(self):
        for session in self:
            # The current transactions without cash in/out lines
            session.total_cash_payments = (
                session.cash_register_total_entry_encoding
                - session.cash_register_total_in
                - session.cash_register_total_out
            )

    @api.depends(
        "cash_real_transaction",
        "cash_real_total_in",
        "cash_real_total_out",
    )
    def _compute_total_real_cash_payment(self):
        for session in self:
            # The real transactions without cash in/out lines
            session.total_real_cash_payments = (
                session.cash_real_transaction
                - session.cash_real_total_in
                - session.cash_real_total_out
            )

    def _validate_session(self):
        # We store the cash in/out totals at the session closure to keep the
        # real amounts. (Like cash_real_transaction)
        self.cash_real_total_in = self.cash_register_total_in
        self.cash_real_total_out = self.cash_register_total_out
        res = super()._validate_session()
        return res
