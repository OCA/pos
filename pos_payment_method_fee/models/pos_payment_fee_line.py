from odoo import _, api, fields, models
from odoo.exceptions import UserError
from odoo.fields import Command
from odoo.tools import float_is_zero


class PosPaymentFeeLine(models.Model):
    _name = "pos.payment.fee.line"
    _description = "POS Payment Fee Line"
    _order = "id"

    payment_id = fields.Many2one(
        comodel_name="pos.payment",
        string="Payment",
        required=True,
        ondelete="cascade",
        index=True,
    )

    fee_rule_id = fields.Many2one(
        comodel_name="pos.payment.method.fee",
        string="Fee Rule",
        required=True,
        ondelete="restrict",
        index=True,
    )

    amount_base = fields.Monetary(required=True)

    fee_amount = fields.Monetary(required=True)

    account_move_line_id = fields.Many2one(
        comodel_name="account.move.line",
        string="Journal Item",
        readonly=True,
        copy=False,
    )

    session_id = fields.Many2one(
        comodel_name="pos.session",
        string="Session",
        required=True,
        index=True,
        ondelete="cascade",
    )

    state = fields.Selection(
        selection=[
            ("draft", "Draft"),
            ("posted", "Posted"),
        ],
        string="Status",
        default="draft",
        required=True,
        copy=False,
    )

    company_id = fields.Many2one(
        related="fee_rule_id.company_id", store=True, readonly=True
    )

    currency_id = fields.Many2one(
        related="payment_id.currency_id", store=True, readonly=True
    )

    # ------------------------------------------------------------------
    # Posting engine
    # ------------------------------------------------------------------
    @api.model
    def _prepare_account_move_vals(self, amount, fee_rule, label):
        """Build the ``account.move`` values for a (grouped or single) fee
        amount. A negative amount (net refunds) flips debit/credit so the
        entry stays balanced and financially correct."""
        company = fee_rule.company_id or self.env.company
        journal = fee_rule.journal_id
        if not journal:
            raise UserError(
                _('Please configure a Posting Journal on fee rule "%(name)s".')
                % {"name": fee_rule.name}
            )
        debit_account = fee_rule.account_id
        credit_account = fee_rule.counterpart_account_id
        if not debit_account or not credit_account:
            raise UserError(
                _(
                    "Please configure both the Fee Account and the "
                    'Counterpart Account on fee rule "%(name)s".'
                )
                % {"name": fee_rule.name}
            )
        if amount < 0:
            debit_account, credit_account = credit_account, debit_account
            amount = -amount
        return {
            "journal_id": journal.id,
            "company_id": company.id,
            "date": fields.Date.today(),
            "ref": label,
            "line_ids": [
                Command.create(
                    {
                        "name": label,
                        "account_id": debit_account.id,
                        "debit": amount,
                        "credit": 0.0,
                    }
                ),
                Command.create(
                    {
                        "name": label,
                        "account_id": credit_account.id,
                        "debit": 0.0,
                        "credit": amount,
                    }
                ),
            ],
        }

    @api.model
    def _post_fee_amount(self, amount, fee_rule, label):
        move = (
            self.env["account.move"]
            .sudo()
            .create(self._prepare_account_move_vals(amount, fee_rule, label))
        )
        move._post()
        return move

    def _post_immediate(self):
        """Post a single fee line right away (Immediate posting policy)."""
        self.ensure_one()
        self.state = "posted"
        precision = self.currency_id.decimal_places if self.currency_id else 2
        if not float_is_zero(self.fee_amount, precision_digits=precision):
            label = _("POS Fee - %(fee_rule)s - Payment #%(payment)s") % {
                "fee_rule": self.fee_rule_id.name,
                "payment": self.payment_id.id,
            }
            move = self._post_fee_amount(self.fee_amount, self.fee_rule_id, label)
            move_line = move.line_ids.filtered(
                lambda l: l.account_id == self.fee_rule_id.account_id
            )[:1]
            self.account_move_line_id = move_line.id

    def action_post_session_close_fees(self):
        """Entry point called at POS session close for all draft fee lines
        whose rule posting_policy is 'session_close'. Splits the recordset
        per payment method grouping policy (grouped vs detailed)."""
        grouped_lines = self.filtered(
            lambda l: l.fee_rule_id.payment_method_id.fee_grouping_policy != "detailed"
        )
        detailed_lines = self - grouped_lines
        grouped_lines._post_grouped_fees()
        detailed_lines._post_detailed_fees()

    def _post_grouped_fees(self):
        """Group homogeneous fees (same fee rule) into a single journal
        entry, as required for high transaction volume retail scenarios."""
        groups = {}
        for line in self:
            groups.setdefault(line.fee_rule_id, self.browse())
            groups[line.fee_rule_id] |= line
        for fee_rule_id, lines in groups.items():
            currency = lines[:1].currency_id
            precision = currency.decimal_places if currency else 2
            total = sum(lines.mapped("fee_amount"))
            if float_is_zero(total, precision_digits=precision):
                lines.write({"state": "posted"})
                continue
            session = lines.session_id[:1]
            label = _("POS Fees (grouped) - %(fee_rule)s - Session %(session)s") % {
                "fee_rule": fee_rule_id.name,
                "session": session.name,
            }
            move = lines._post_fee_amount(total, fee_rule_id, label)
            move_line = move.line_ids.filtered(
                lambda l: l.account_id == fee_rule_id.account_id
            )[:1]
            lines.write({"account_move_line_id": move_line.id, "state": "posted"})

    def _post_detailed_fees(self):
        """Post one journal entry per fee line, preserving full per
        transaction traceability (audit friendly)."""
        for line in self:
            line._post_immediate()
