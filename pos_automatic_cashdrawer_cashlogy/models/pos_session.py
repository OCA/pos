# Copyright (C) 2019 Druidoo <https://www.druidoo.io>

from odoo import api, models


class PosSession(models.Model):
    _inherit = "pos.session"

    def js_check_cash_in_out_possible(self):
        self.ensure_one()
        if not self.cash_journal_id:
            return {
                "error": True,
                "message": self.env._(
                    "There's no cash payment method for this PoS Session"
                ),
            }
        if not self.cash_journal_id.company_id.transfer_account_id:
            return {
                "error": True,
                "message": self.env._(
                    "Please check that the field 'Inter-Banks Transfer Account' is set "
                    "on the company."
                ),
            }
        statement_complete = self.statement_line_ids.filtered("statement_complete")
        if statement_complete:
            return {
                "error": True,
                "message": self.env._(
                    "The cash register has already been opened for this session."
                ),
            }
        return {
            "error": False,
            "message": "",
        }

    @api.model
    def _get_cash_in_out_fields(self):
        return [
            "id",
            "display_name",
            "ref",
            "create_date",
            "date",
            "statement_id",
        ]

    def action_put_money_in(self, amount, reason, extras):
        self.ensure_one()
        self.try_cash_in_out(
            "in",
            amount,
            reason,
            extras,
        )
        return (
            self.env["account.bank.statement.line"]
            .sudo()
            .search(
                [
                    ("pos_session_id", "=", self.id),
                    ("journal_id", "=", self.cash_journal_id.id),
                ],
                limit=1,
                order="id desc",
            )
            .read(self._get_cash_in_out_fields())[0]
        )

    def action_take_money_out(self, amount, reason, extras):
        self.ensure_one()
        self.try_cash_in_out(
            "out",
            amount,
            reason,
            extras,
        )
        return (
            self.env["account.bank.statement.line"]
            .sudo()
            .search(
                [
                    ("pos_session_id", "=", self.id),
                    ("journal_id", "=", self.cash_journal_id.id),
                ],
                limit=1,
                order="id desc",
            )
            .read(self._get_cash_in_out_fields())[0]
        )
