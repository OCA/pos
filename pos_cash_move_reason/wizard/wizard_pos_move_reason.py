# © 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, fields, models
from odoo.exceptions import UserError


class WizardPosMoveReason(models.TransientModel):
    _name = "wizard.pos.move.reason"
    _description = "PoS Move Reasons Wizard"

    def _default_move_type(self):
        return self.env.context.get("default_move_type", "expense")

    def _default_session_id(self):
        return self.env.context.get("active_id", False)

    _MOVE_TYPE_SELECTION = [
        ("income", "Put Money In"),
        ("expense", "Take Money Out"),
    ]

    move_type = fields.Selection(
        selection=_MOVE_TYPE_SELECTION, default=_default_move_type
    )

    move_reason_id = fields.Many2one(
        comodel_name="pos.move.reason", string="Move Reason", required=True
    )

    journal_id = fields.Many2one(
        comodel_name="account.journal",
        string="Journal",
        domain="[('id', 'in', journal_ids)]",
        required=True,
    )

    session_id = fields.Many2one(
        comodel_name="pos.session",
        string="Current Session",
        default=_default_session_id,
        required=True,
        readonly=True,
    )

    statement_id = fields.Many2one(
        comodel_name="account.bank.statement",
        string="Bank Statement",
        compute="_compute_statement_id",
    )

    journal_ids = fields.Many2many(
        comodel_name="account.journal", related="move_reason_id.journal_ids"
    )

    name = fields.Char(string="Reason", required=True)

    amount = fields.Float(required=True)

    @api.onchange("move_type")
    def onchange_move_type(self):
        if self.move_type == "income":
            return {"domain": {"move_reason_id": [("is_income_reason", "=", True)]}}
        else:
            return {"domain": {"move_reason_id": [("is_expense_reason", "=", True)]}}

    @api.onchange("move_reason_id")
    def onchange_reason(self):
        if len(self.journal_ids) == 1:
            self.journal_id = fields.first(self.journal_ids).id
        self.name = self.move_reason_id.name

    @api.constrains("amount")
    def _check_amount(self):
        if any(w.amount <= 0 for w in self):
            raise UserError(_("Invalid Amount"))

    @api.depends("journal_id", "session_id")
    def _compute_statement_id(self):
        for wizard in self:
            statement = self.env["account.bank.statement"].browse()
            if wizard.session_id and wizard.journal_id:
                statements = wizard.session_id.statement_ids.filtered(
                    lambda x, w=wizard: x.journal_id == w.journal_id
                )
                statement = fields.first(statements)
            wizard.statement_id = statement

    def apply(self):
        self.ensure_one()
        AccountBankStatementLine = self.env["account.bank.statement.line"]
        AccountBankStatementLine.create(self._prepare_statement_line())

    def _prepare_statement_line(self):
        self.ensure_one()
        if self.move_type == "income":
            amount = self.amount
            account_id = self.move_reason_id.income_account_id.id
        else:
            amount = -self.amount
            account_id = self.move_reason_id.expense_account_id.id
        return {
            "date": fields.Date.context_today(self),
            "statement_id": self.statement_id.id,
            "journal_id": self.journal_id.id,
            "amount": amount,
            "payment_ref": f"{self.session_id.name} - {self.name}",
            "counterpart_account_id": account_id,
        }
