# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import UserError, ValidationError
from odoo.fields import Command


class PosConfig(models.Model):
    _inherit = "pos.config"

    foreign_currency_ids = fields.Many2many(
        comodel_name="res.currency",
        relation="pos_config_foreign_currency_rel",
        column1="pos_config_id",
        column2="currency_id",
        string="Foreign Currencies",
        help="Currencies the cashier can take on a payment line. "
        "Leave empty to take payments in the Point of Sale currency only.",
    )

    def write(self, vals):
        """Write values, blocking an illegal foreign-currency list change.

        :param dict vals: field values
        :return: ``True``
        :rtype: bool
        :raise UserError: the currency list cannot change with an open session
            or a non-zero counted closing
        """
        if "foreign_currency_ids" in vals:
            self._check_foreign_currency_change(
                self._foreign_currency_commands(vals["foreign_currency_ids"])
            )
        return super().write(vals)

    def _check_foreign_currency_change(self, commands):
        """Block a currency-list change that an open session or a drawer forbids.

        ``@api.constrains`` only sees the value after the write, so the open-session
        lock and the non-zero closing balance are checked here, on the commands.

        :param list commands: many2many commands for ``foreign_currency_ids``
        :raise UserError: a session is open, or a removed currency still
            has a counted closing
        """
        for config in self:
            new_ids, creates = config._foreign_currency_ids_from_commands(commands)
            if not creates and new_ids == set(config.foreign_currency_ids.ids):
                continue
            open_sessions = config.session_ids.filtered(
                lambda session: session.state != "closed"
            )
            if open_sessions:
                raise UserError(
                    _(
                        "Close the open sessions of %(pos)s before "
                        "changing Foreign Currencies.",
                        pos=config.display_name,
                    )
                )
            removed = set(config.foreign_currency_ids.ids) - new_ids
            config._check_removed_foreign_currencies(removed)

    def _foreign_currency_commands(self, value):
        """Normalize a many2many write value to command tuples.

        :param value: commands, a recordset, ``False`` or a list of ids
        :return: command list
        :rtype: list
        """
        if isinstance(value, tuple):
            value = [Command.set(value)]
        elif isinstance(value, models.BaseModel) and value._name == "res.currency":
            value = [Command.set(value.ids)]
        elif value is False or value is None:
            value = [Command.clear()]
        elif (
            isinstance(value, list) and value and not isinstance(value[0], tuple | list)
        ):
            value = [Command.set(tuple(value))]
        return value

    def _foreign_currency_ids_from_commands(self, commands):
        """Apply many2many commands to the current currency list.

        :param list commands: many2many commands
        :return: resulting currency ids, and whether a currency is created
        :rtype: tuple
        """
        currency_ids = set(self.foreign_currency_ids.ids)
        creates = False
        for command in commands:
            operation = command[0]
            if operation == Command.CLEAR:
                currency_ids.clear()
            elif operation == Command.SET:
                currency_ids = set(command[2])
            elif operation == Command.LINK:
                currency_ids.add(command[1])
            elif operation == Command.CREATE:
                creates = True
            elif operation in (Command.UNLINK, Command.DELETE):
                currency_ids.discard(command[1])
        return currency_ids, creates

    def _check_removed_foreign_currencies(self, removed_ids):
        """Refuse to drop a currency whose last counted closing is not zero.

        :param set removed_ids: currency ids leaving the list
        :raise UserError: a removed currency still has a counted closing
        """
        if not removed_ids:
            return
        last_session = self.env["pos.session"].search(
            [("config_id", "=", self.id), ("state", "=", "closed")],
            limit=1,
        )
        if not last_session:
            return
        held = last_session.currency_balance_ids.filtered(
            lambda balance: balance.currency_id.id in removed_ids
            and not balance.currency_id.is_zero(balance.balance_end_real)
        )
        if held:
            raise UserError(
                _(
                    "Count %(currencies)s down to zero before "
                    "removing it from %(pos)s.",
                    currencies=", ".join(held.currency_id.mapped("name")),
                    pos=self.display_name,
                )
            )

    @api.constrains("foreign_currency_ids", "journal_id", "company_id")
    def _check_foreign_currency_ids(self):
        """Refuse a foreign list when the Point of Sale currency is not company.

        :raise ValidationError: the Point of Sale currency is foreign, or the
            Point of Sale currency is listed as a foreign currency
        """
        for config in self:
            if not config.foreign_currency_ids:
                continue
            if config.currency_id != config.company_id.currency_id:
                raise ValidationError(
                    _(
                        "Foreign currencies on %(pos)s require the "
                        "Point of Sale currency to be the company currency.",
                        pos=config.display_name,
                    )
                )
            if config.currency_id in config.foreign_currency_ids:
                raise ValidationError(
                    _(
                        "The Point of Sale currency cannot be listed "
                        "as a foreign currency on %(pos)s.",
                        pos=config.display_name,
                    )
                )
