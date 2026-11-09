from collections import defaultdict

from odoo import _, api, fields, models
from odoo.exceptions import AccessError, UserError
from odoo.fields import Command


class PosPaymentFeeLine(models.Model):
    """Fee ledger: one record per fee computed on a validated POS payment.

    A fee line keeps a snapshot of the conditions used to compute it, so
    that it never depends on the current configuration of its rule or
    payment method to be posted.
    """

    _name = "pos.payment.fee.line"
    _description = "POS Payment Fee Line"
    _order = "id desc"

    payment_id = fields.Many2one(
        comodel_name="pos.payment",
        required=True,
        readonly=True,
        ondelete="restrict",
        index=True,
    )
    pos_order_id = fields.Many2one(
        related="payment_id.pos_order_id",
        store=True,
        index=True,
    )
    session_id = fields.Many2one(
        comodel_name="pos.session",
        required=True,
        readonly=True,
        ondelete="restrict",
        index=True,
    )
    payment_method_id = fields.Many2one(
        comodel_name="pos.payment.method",
        required=True,
        readonly=True,
        ondelete="restrict",
    )
    fee_rule_id = fields.Many2one(
        comodel_name="pos.payment.method.fee",
        string="Fee Rule",
        required=True,
        readonly=True,
        ondelete="restrict",
        index=True,
    )
    company_id = fields.Many2one(
        comodel_name="res.company",
        required=True,
        readonly=True,
        index=True,
    )
    currency_id = fields.Many2one(
        comodel_name="res.currency",
        required=True,
        readonly=True,
        help="Currency of the payment.",
    )
    company_currency_id = fields.Many2one(
        related="company_id.currency_id",
        string="Company Currency",
    )
    payment_date = fields.Datetime(
        required=True,
        readonly=True,
        help="Date of the payment, used for currency conversion.",
    )
    amount_base = fields.Monetary(
        string="Payment Amount",
        readonly=True,
    )
    fee_type = fields.Selection(
        selection=[
            ("percentage", "Percentage"),
            ("fixed", "Fixed"),
        ],
        required=True,
        readonly=True,
    )
    fee_value = fields.Float(
        digits="Product Price",
        readonly=True,
        help="Percentage or fixed amount applied, as configured on the rule "
        "when the fee was computed.",
    )
    fee_currency_id = fields.Many2one(
        comodel_name="res.currency",
        readonly=True,
        help="Currency of the fixed amount applied.",
    )
    fee_amount = fields.Monetary(
        readonly=True,
        help="Fee amount in the payment currency.",
    )
    fee_amount_company = fields.Monetary(
        string="Fee Amount (Company Currency)",
        currency_field="company_currency_id",
        readonly=True,
    )
    account_id = fields.Many2one(
        comodel_name="account.account",
        string="Fee Account",
        required=True,
        readonly=True,
    )
    counterpart_account_id = fields.Many2one(
        comodel_name="account.account",
        required=True,
        readonly=True,
    )
    journal_id = fields.Many2one(
        comodel_name="account.journal",
        string="Posting Journal",
        required=True,
        readonly=True,
    )
    posting_policy = fields.Selection(
        selection=[
            ("immediate", "Immediate"),
            ("session_close", "At Session Close"),
        ],
        required=True,
        readonly=True,
    )
    grouping_policy = fields.Selection(
        selection=[
            ("grouped", "Grouped"),
            ("detailed", "Detailed"),
        ],
        required=True,
        readonly=True,
    )
    state = fields.Selection(
        selection=[
            ("pending", "Pending"),
            ("posted", "Posted"),
            ("error", "Error"),
        ],
        default="pending",
        required=True,
        readonly=True,
        index=True,
        copy=False,
    )
    error_message = fields.Text(
        readonly=True,
        copy=False,
    )
    posting_date = fields.Date(
        string="Accounting Date",
        readonly=True,
        copy=False,
        help="Accounting date of the fee. Once set, it is kept when posting "
        "is retried.",
    )
    move_id = fields.Many2one(
        comodel_name="account.move",
        string="Journal Entry",
        readonly=True,
        copy=False,
        index="btree_not_null",
    )
    account_move_line_id = fields.Many2one(
        comodel_name="account.move.line",
        string="Journal Item",
        readonly=True,
        copy=False,
        help="Expense journal item that records this fee. In grouped mode it "
        "is shared by the fees aggregated in it.",
    )

    _sql_constraints = [
        (
            "payment_rule_uniq",
            "UNIQUE(payment_id, fee_rule_id)",
            "A fee rule can only be applied once per payment.",
        ),
    ]

    @api.ondelete(at_uninstall=False)
    def _unlink_except_posted(self):
        if any(line.state == "posted" for line in self):
            raise UserError(_("Posted payment fees cannot be deleted."))

    def action_retry_posting(self):
        """Retry posting the fees in error, e.g. once the accounting
        configuration or the lock date has been fixed."""
        if not (
            self.env.user.has_group("point_of_sale.group_pos_manager")
            or self.env.user.has_group("account.group_account_manager")
        ):
            raise AccessError(
                _("Only POS or accounting managers can retry posting payment fees.")
            )
        self.sudo().filtered(lambda line: line.state == "error")._post_fee_lines()
        return True

    @api.model
    def _prepare_fee_line_vals(self, payment, rule, fee_amount, fee_amount_company):
        method = payment.payment_method_id
        return {
            "payment_id": payment.id,
            "session_id": payment.session_id.id,
            "payment_method_id": method.id,
            "fee_rule_id": rule.id,
            "company_id": payment.company_id.id,
            "currency_id": payment.currency_id.id,
            "payment_date": payment.payment_date,
            "amount_base": payment.amount,
            "fee_type": rule.fee_type,
            "fee_value": rule.amount,
            "fee_currency_id": rule.fee_type == "fixed" and rule.currency_id.id,
            "fee_amount": fee_amount,
            "fee_amount_company": fee_amount_company,
            "account_id": rule.account_id.id,
            "counterpart_account_id": rule._get_counterpart_account().id,
            "journal_id": rule.journal_id.id,
            "posting_policy": rule.posting_policy,
            "grouping_policy": method.fee_grouping_policy,
        }

    def _get_posting_date(self):
        """Accounting date determined by the business event: the order
        validation for immediate fees, the session closing otherwise."""
        self.ensure_one()
        if self.posting_policy == "immediate":
            return fields.Date.context_today(
                self, timestamp=self.pos_order_id.date_order
            )
        session = self.session_id
        if session.move_id:
            return session.move_id.date
        if session.stop_at:
            return fields.Date.context_today(self, timestamp=session.stop_at)
        return False

    def _get_posting_group_key(self):
        self.ensure_one()
        return (self.session_id, self.company_id, self.journal_id, self.posting_date)

    def _lock_for_posting(self):
        """Lock the fee lines to post and keep the ones still pending.

        Rows locked by another transaction (concurrent retry or closing)
        are skipped, so a fee can never be posted twice.
        """
        if not self:
            return self
        self.flush_recordset()
        self.env.cr.execute(
            "SELECT id FROM pos_payment_fee_line WHERE id IN %s "
            "FOR UPDATE SKIP LOCKED",
            (tuple(self.ids),),
        )
        locked = self.browse([row[0] for row in self.env.cr.fetchall()])
        locked.invalidate_recordset(["state", "move_id"])
        return locked.filtered(
            lambda line: line.state in ("pending", "error") and not line.move_id
        )

    def _post_fee_lines(self):
        """Post the given fee lines, one atomic journal entry per group.

        A group that fails is rolled back as a whole and its fees are left
        in error with the reason, without blocking the other groups nor the
        caller (POS order synchronisation or session closing).
        """
        lines = self._lock_for_posting()
        for line in lines.filtered(lambda line: not line.posting_date):
            posting_date = line._get_posting_date()
            if posting_date:
                line.posting_date = posting_date
            else:
                line.write(
                    {
                        "state": "error",
                        "error_message": _(
                            "The accounting date of the session closing cannot be "
                            "determined."
                        ),
                    }
                )
        groups = defaultdict(lambda: self.browse())
        for line in lines.filtered("posting_date"):
            groups[line._get_posting_group_key()] |= line
        for group_lines in groups.values():
            try:
                with self.env.cr.savepoint():
                    group_lines._post_group()
            except UserError as error:
                group_lines.write({"state": "error", "error_message": str(error)})

    def _get_expense_line_groups(self):
        """Fee lines aggregated in each expense journal item."""
        groups = defaultdict(lambda: self.browse())
        for line in self:
            if line.grouping_policy == "detailed":
                key = line
            else:
                key = (line.account_id, line.currency_id)
            groups[key] |= line
        return list(groups.values())

    def _get_counterpart_line_groups(self):
        groups = defaultdict(lambda: self.browse())
        for line in self:
            groups[(line.counterpart_account_id, line.currency_id)] |= line
        return list(groups.values())

    def _prepare_move_line_vals(self, account, label, sign):
        """Journal item values for the fee lines in ``self``, which share
        the same account and currency."""
        currency = self[:1].currency_id
        company_currency = self[:1].company_currency_id
        return {
            "name": label,
            "account_id": account.id,
            "currency_id": currency.id,
            "amount_currency": sign * currency.round(sum(self.mapped("fee_amount"))),
            "balance": sign
            * company_currency.round(sum(self.mapped("fee_amount_company"))),
        }

    def _get_expense_line_label(self):
        if len(self) == 1:
            return _(
                "POS fee %(rule)s - %(payment)s",
                rule=self.fee_rule_id.name,
                payment=self.payment_id.display_name,
            )
        return _("POS fees %(account)s", account=self[:1].account_id.display_name)

    def _prepare_move_vals(self):
        """Journal entry values for one posting group (see
        ``_get_posting_group_key``)."""
        first = self[:1]
        label = _("POS payment fees - %(session)s", session=first.session_id.name)
        expense_groups = self._get_expense_line_groups()
        line_commands = [
            Command.create(
                group._prepare_move_line_vals(
                    group[:1].account_id, group._get_expense_line_label(), 1
                )
            )
            for group in expense_groups
        ]
        line_commands += [
            Command.create(
                group._prepare_move_line_vals(
                    group[:1].counterpart_account_id, label, -1
                )
            )
            for group in self._get_counterpart_line_groups()
        ]
        move_vals = {
            "move_type": "entry",
            "journal_id": first.journal_id.id,
            "company_id": first.company_id.id,
            "date": first.posting_date,
            "ref": label,
            "line_ids": line_commands,
        }
        return move_vals, expense_groups

    def _post_group(self):
        move_vals, expense_groups = self._prepare_move_vals()
        move = (
            self.env["account.move"].with_company(self[:1].company_id).create(move_vals)
        )
        move._post(soft=False)
        expense_move_lines = move.line_ids.sorted("id")[: len(expense_groups)]
        for group, move_line in zip(expense_groups, expense_move_lines):
            group.write(
                {
                    "state": "posted",
                    "error_message": False,
                    "move_id": move.id,
                    "account_move_line_id": move_line.id,
                }
            )
