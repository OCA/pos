# Copyright (C) 2019 Druidoo <https://www.druidoo.io>

import logging

from odoo import api, models, _
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)


class PosSession(models.Model):
    _inherit = "pos.session"

    @api.multi
    def check_opening_balance_missing(self):
        """
        Checks if the opening balance is missing
        If it is, returns the theoretical starting balance
        """
        self.ensure_one()
        self.check_cash_in_out_possible()
        missing = True
        if self.cash_register_id.cashbox_start_id:
            # Cashbox already started
            missing = False
        if self.cash_register_id.line_ids:
            _logger.warning("Cashbox is missing but there are already lines")
            missing = False
        return {
            "missing": missing,
            "balance_start": self.cash_register_balance_start,
        }

    @api.multi
    def action_set_balance(self, inventory, balance="start"):
        """
        Sets the opening balance.
        Inventory is a dict with:
        { denomination: quantity }
        """
        self.ensure_one()
        self.check_cash_in_out_possible()
        # Try to fetch current cashbox
        if balance == "start":
            cashbox = self.cash_register_id.cashbox_start_id
        else:
            cashbox = self.cash_register_id.cashbox_end_id
        # Or create a new one..
        if not cashbox:
            cashbox = self.env["account.bank.statement.cashbox"].create({})
        # Add context values
        cashbox = cashbox.with_context(
            bank_statement_id=self.cash_register_id.id, balance=balance
        )
        # Replace lines with inventory
        cashbox.cashbox_lines_ids = [(5, 0, 0)]
        cashbox.cashbox_lines_ids = [
            (0, 0, {"coin_value": value, "number": number})
            for value, number in inventory.items()
        ]
        # Validate
        cashbox.validate()
        return True

    @api.multi
    def check_cash_in_out_possible(self):
        self.ensure_one()
        if not self.cash_register_id:
            raise UserError(_("There's no cash register on this session"))
        if not self.cash_register_id.journal_id:
            raise UserError(
                _(
                    "Please check that the field 'Journal' is set "
                    "on the Bank Statement"
                )
            )
        if not self.cash_register_id.journal_id.company_id.transfer_account_id:
            raise UserError(
                _(
                    "Please check that the field 'Transfer Account' is set "
                    "on the company."
                )
            )
        if self.cash_register_id.state == "confirm":
            raise UserError(
                _(
                    "You cannot put/take money in/out for a bank statement "
                    "which is closed."
                )
            )
        return True

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

    @api.multi
    def action_put_money_in(self, amount, reason):
        self.ensure_one()
        wizard = self.env["cash.box.in"].create(
            {"amount": amount, "name": reason}
        )
        wizard.with_context(active_model=self._name, active_ids=self.ids).run()
        # Return the last added line
        return (
            self.env["account.bank.statement.line"]
            .sudo()
            .search(
                [("statement_id", "=", self.cash_register_id.id)],
                limit=1,
                order="id desc",
            )
            .read(self._get_cash_in_out_fields())[0]
        )

    @api.multi
    def action_take_money_out(self, amount, reason):
        self.ensure_one()
        wizard = self.env["cash.box.out"].create(
            {"amount": amount, "name": reason}
        )
        wizard.with_context(active_model=self._name, active_ids=self.ids).run()
        # Return the last added line
        return (
            self.env["account.bank.statement.line"]
            .sudo()
            .search(
                [("statement_id", "=", self.cash_register_id.id)],
                limit=1,
                order="id desc",
            )
            .read(self._get_cash_in_out_fields())[0]
        )
