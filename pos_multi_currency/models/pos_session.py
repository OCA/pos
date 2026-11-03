# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import math

from odoo import _, api, fields, models
from odoo.exceptions import AccessError, UserError
from odoo.tools import float_is_zero


class PosSession(models.Model):
    _inherit = "pos.session"

    currency_balance_ids = fields.One2many(
        comodel_name="pos.session.currency.balance",
        inverse_name="session_id",
    )

    # -------------------------------------------------------------------------
    # Rates
    # -------------------------------------------------------------------------

    @api.model
    def _round_foreign_rate(self, rate):
        """Round a tender rate to six significant digits.

        :param float rate: foreign-currency units per one Point of Sale unit
        :return: rounded rate
        :rtype: float
        """
        if not rate:
            return 0.0
        magnitude = math.floor(math.log10(abs(rate)))
        decimals = 6 - magnitude - 1
        return round(rate, int(decimals))

    @api.model
    def _format_foreign_rate(self, rate):
        """Format a tender rate with the user's separators and no trailing zeros.

        :param float rate: foreign-currency units per one Point of Sale unit
        :return: formatted rate
        :rtype: str
        """
        rounded = self._round_foreign_rate(rate)
        if not rounded:
            text = "0"
        else:
            decimals = max(0, 6 - math.floor(math.log10(abs(rounded))) - 1)
            text = f"{abs(rounded):.{int(decimals)}f}"
            # Whole rates have no decimal point. rstrip would eat their zeros.
            if "." in text:
                text = text.rstrip("0").rstrip(".")
            if rounded < 0:
                text = "-" + text
        lang = self.env["res.lang"]._lang_get(self.env.lang or "en_US")
        if not lang:
            return text
        sign = ""
        if text.startswith("-"):
            sign = "-"
            text = text[1:]
        if "." in text:
            whole, fraction = text.split(".", 1)
            whole = self._group_rate_digits(whole, lang.thousands_sep or "")
            text = whole + (lang.decimal_point or ".") + fraction
        else:
            text = self._group_rate_digits(text, lang.thousands_sep or "")
        return sign + text

    @api.model
    def _group_rate_digits(self, digits, separator):
        """Insert a thousands separator every three digits.

        :param str digits: integer part, without a sign
        :param str separator: thousands separator
        :return: grouped digits
        :rtype: str
        """
        if not separator or len(digits) <= 3:
            return digits
        groups = []
        while digits:
            groups.append(digits[-3:])
            digits = digits[:-3]
        return separator.join(reversed(groups))

    def _pos_rate(self, currency, date=None):
        """Foreign-currency units for one unit of the Point of Sale currency.

        :param currency: ``res.currency`` record
        :param date: rate date, default today
        :return: conversion rate
        :rtype: float
        """
        self.ensure_one()
        return self.env["res.currency"]._get_conversion_rate(
            self.currency_id,
            currency,
            self.company_id,
            date or fields.Date.context_today(self),
        )

    # -------------------------------------------------------------------------
    # Cash control in the Point of Sale currency
    # -------------------------------------------------------------------------

    def _get_cash_control_method(self):
        """Return the single cash-counted payment method of this session.

        :return: ``pos.payment.method`` record, possibly empty
        """
        self.ensure_one()
        return self.payment_method_ids.filtered("is_cash_count")[:1]

    def _pos_currency_cash_payments_domain(self):
        """Domain of cash payments that belong in the Point of Sale drawer.

        :return: domain
        :rtype: list
        """
        self.ensure_one()
        method = self._get_cash_control_method()
        return [
            ("session_id", "=", self.id),
            ("payment_method_id", "=", method.id),
            ("foreign_currency_id", "=", False),
        ]

    def _pos_currency_statement_lines(self):
        """Statement lines denominated in the Point of Sale currency.

        :return: ``account.bank.statement.line`` recordset
        """
        self.ensure_one()
        # Match core: cashiers can lack move-line rights on the statement.
        return self.sudo().statement_line_ids.filtered(
            lambda line: not line.foreign_currency_id
        )

    @api.depends(
        "statement_line_ids.foreign_currency_id",
        "statement_line_ids.amount",
        "order_ids.payment_ids.foreign_currency_id",
        "order_ids.payment_ids.amount",
        "cash_real_transaction",
    )
    def _compute_cash_balance(self):
        """Recompute the Point of Sale currency cash drawer without foreign tenders.

        :return: result of the core compute
        """
        super_result = super()._compute_cash_balance()
        for session in self:
            method = session._get_cash_control_method()
            if not method:
                continue
            result = self.env["pos.payment"]._read_group(
                session._pos_currency_cash_payments_domain(),
                aggregates=["amount:sum"],
            )
            total_cash_payment = result[0][0] or 0.0
            last_session = session.search(
                [("config_id", "=", session.config_id.id), ("id", "<", session.id)],
                limit=1,
            )
            if session.state == "closed":
                session.cash_register_total_entry_encoding = (
                    session.cash_real_transaction + total_cash_payment
                )
            else:
                session.cash_register_total_entry_encoding = (
                    sum(session._pos_currency_statement_lines().mapped("amount"))
                    + total_cash_payment
                )
            session.cash_register_balance_end = (
                last_session.cash_register_balance_end_real
                + session.cash_register_total_entry_encoding
            )
            session.cash_register_difference = (
                session.cash_register_balance_end_real
                - session.cash_register_balance_end
            )
        return super_result

    def get_closing_control_data(self):
        """Closing popup totals in the Point of Sale currency only.

        Foreign tenders are dropped from the cash drawer and from every other
        payment method. Pay-later and Point of Sale currency payments stay.

        :return: closing control payload
        :rtype: dict
        """
        data = super().get_closing_control_data()
        self.ensure_one()
        orders = self._get_closed_orders()
        payments = orders.payment_ids.filtered(
            lambda payment: not payment.foreign_currency_id
        )
        statement_lines = self._pos_currency_statement_lines()
        default_cash = data.get("default_cash_details")
        if default_cash:
            method = self.env["pos.payment.method"].browse(default_cash["id"])
            payment_amount = sum(
                payments.filtered(
                    lambda payment: payment.payment_method_id == method
                ).mapped("amount")
            )
            # Use the opening figure from super(). Core keeps the previous
            # session end and posts the counted opening as a statement line.
            # pos_cash_control_extension stores the count on
            # cash_register_balance_start and posts no opening line. Either
            # way, amount = opening + payments + statement lines.
            default_cash["payment_amount"] = payment_amount
            default_cash["amount"] = (
                default_cash["opening"]
                + payment_amount
                + sum(statement_lines.mapped("amount"))
            )
            default_cash["moves"] = [
                {
                    "name": line.payment_ref or line.name,
                    "amount": line.amount,
                }
                for line in statement_lines.sorted("create_date")
            ]
        payments_by_method = {}
        for payment in payments:
            payments_by_method.setdefault(payment.payment_method_id.id, []).append(
                payment
            )
        for method_data in data.get("other_payment_methods") or []:
            method_payments = payments_by_method.get(method_data["id"], [])
            method_data["amount"] = sum(payment.amount for payment in method_payments)
            method_data["number"] = len(method_payments)
        return data

    def action_pos_session_closing_control(
        self,
        balancing_account=False,
        amount_to_balance=0,
        bank_payment_method_diffs=None,
    ):
        """Close the session, keeping foreign tenders out of the cash drawer.

        Core assigns the rescue cash count from every cash payment. Foreign
        tenders are excluded here, and each foreign drawer is counted at its
        expected balance so a rescue close posts no foreign difference.

        :param balancing_account: force-close account, or ``False``
        :param float amount_to_balance: amount left for the force-close wizard
        :param dict bank_payment_method_diffs: core bank differences
        :return: close action, or ``True`` when the session closed
        :raise UserError: draft orders remain, or the session is already closed
        """
        bank_payment_method_diffs = bank_payment_method_diffs or {}
        for session in self:
            if any(order.state == "draft" for order in session.order_ids):
                raise UserError(
                    _("You cannot close the POS when orders are still in draft")
                )
            if session.state == "closed":
                raise UserError(_("This session is already closed."))
            stop_at = session.stop_at or fields.Datetime.now()
            session.write({"state": "closing_control", "stop_at": stop_at})
            return session._close_session_with_foreign_control(
                balancing_account, amount_to_balance, bank_payment_method_diffs
            )

    def _close_session_with_foreign_control(
        self, balancing_account, amount_to_balance, bank_payment_method_diffs
    ):
        """Validate one session, with foreign rescue totals excluded.

        :param balancing_account: force-close account, or ``False``
        :param float amount_to_balance: amount left for the force-close wizard
        :param dict bank_payment_method_diffs: core bank differences
        :return: close action, or ``True`` when the session closed
        """
        self.ensure_one()
        if not self.config_id.cash_control:
            return self.action_pos_session_close(
                balancing_account, amount_to_balance, bank_payment_method_diffs
            )
        if self.rescue and self.config_id.cash_control:
            method = self.payment_method_ids.filtered(lambda pm: pm.type == "cash")[:1]
            orders = self._get_closed_orders()
            total_cash = sum(
                orders.payment_ids.filtered(
                    lambda payment, method=method: payment.payment_method_id == method
                    and not payment.foreign_currency_id
                ).mapped("amount")
            )
            self.cash_register_balance_end_real = (
                total_cash + self.cash_register_balance_start
            )
            self._set_foreign_rescue_closing()
        return self.action_pos_session_validate(
            balancing_account, amount_to_balance, bank_payment_method_diffs
        )

    def _validate_session(
        self,
        balancing_account=False,
        amount_to_balance=0,
        bank_payment_method_diffs=None,
    ):
        """Validate the session and post foreign closing differences.

        :param balancing_account: force-close account, or ``False``
        :param float amount_to_balance: amount left for the force-close wizard
        :param dict bank_payment_method_diffs: core bank differences
        :return: ``True`` when the session closed, otherwise a client action
        :raise UserError: a foreign difference or exchange account is missing
        """
        self.ensure_one()
        self._check_foreign_difference_accounts()
        # Before the accounting savepoint. A missing exchange journal must
        # leave the session in closing control and must not post a move.
        self._check_foreign_exchange_accounts()
        snapshot = sum(self._pos_currency_statement_lines().mapped("amount"))
        result = super()._validate_session(
            balancing_account, amount_to_balance, bank_payment_method_diffs
        )
        if result is True:
            self.cash_real_transaction = snapshot
            self.sudo()._post_foreign_closing_differences()
        return result

    # -------------------------------------------------------------------------
    # Foreign drawer
    # -------------------------------------------------------------------------

    def _previous_closed_session(self):
        """Return the previous closed session of this Point of Sale.

        :return: ``pos.session`` record, possibly empty
        """
        self.ensure_one()
        return self.search(
            [
                ("config_id", "=", self.config_id.id),
                ("id", "<", self.id),
                ("state", "=", "closed"),
            ],
            limit=1,
        )

    def _get_currency_balance(self, method, currency, create=False):
        """Return the balance row of a method and currency.

        :param method: ``pos.payment.method`` record
        :param currency: ``res.currency`` record
        :param bool create: create the row when it is missing
        :return: ``pos.session.currency.balance`` record, possibly empty
        """
        self.ensure_one()
        row = self.currency_balance_ids.filtered(
            lambda balance: balance.payment_method_id == method
            and balance.currency_id == currency
        )[:1]
        if not row and create:
            row = self.env["pos.session.currency.balance"].create(
                {
                    "session_id": self.id,
                    "payment_method_id": method.id,
                    "currency_id": currency.id,
                }
            )
        return row

    def _is_foreign_drawer_line(self, line):
        """A drawer line is an opening difference or a cash in/out.

        Tender lines use the receivable. Closing differences use the loss or
        profit account. Both are created while the session closes, so they
        stay out of the expected balance the same way core's snapshot does.

        :param line: ``account.bank.statement.line`` record
        :return: whether the line moves the foreign drawer
        :rtype: bool
        """
        # A cashier can read the statement line but not its journal items.
        line = line.sudo()
        suspense = line.journal_id.suspense_account_id
        liquidity = line.journal_id.default_account_id
        if not suspense or not line.move_id:
            return False
        others = line.move_id.line_ids.filtered(lambda aml: aml.account_id != liquidity)
        return bool(others) and all(aml.account_id == suspense for aml in others)

    def _foreign_drawer_move_amount(self, currency):
        """Sum opening differences and cash in/out in one foreign currency.

        :param currency: ``res.currency`` record
        :return: signed amount in that currency
        :rtype: float
        """
        self.ensure_one()
        lines = self.statement_line_ids.filtered(
            lambda line: line.foreign_currency_id == currency
            and self._is_foreign_drawer_line(line)
        )
        return currency.round(sum(lines.mapped("amount_currency")))

    def _foreign_tender_amount(self, method, currency):
        """Sum foreign tenders of one method, excluding change.

        :param method: ``pos.payment.method`` record
        :param currency: ``res.currency`` record
        :return: signed amount in that currency
        :rtype: float
        """
        self.ensure_one()
        payments = self._get_closed_orders().payment_ids.filtered(
            lambda payment: payment.payment_method_id == method
            and payment.foreign_currency_id == currency
            and not payment.is_change
        )
        return currency.round(sum(payments.mapped("amount_currency")))

    def _foreign_cash_expected(self, currency):
        """Expected contents of the foreign cash drawer.

        :param currency: ``res.currency`` record
        :return: amount in that currency
        :rtype: float
        """
        self.ensure_one()
        method = self._get_cash_control_method()
        if not method:
            return 0.0
        previous = self._previous_closed_session()
        opening = 0.0
        if previous:
            row = previous._get_currency_balance(method, currency)
            opening = row.balance_end_real if row else 0.0
        return currency.round(
            opening
            + self._foreign_drawer_move_amount(currency)
            + self._foreign_tender_amount(method, currency)
        )

    def _set_foreign_rescue_opening(self):
        """Carry each foreign counted closing into a rescue session.

        A rescue session skips the opening control, so no opening statement
        line is posted.
        """
        for session in self:
            method = session._get_cash_control_method()
            previous = session._previous_closed_session()
            if not method or not previous:
                continue
            for currency in session.config_id.foreign_currency_ids:
                row = previous._get_currency_balance(method, currency)
                if not row:
                    continue
                balance = session._get_currency_balance(method, currency, create=True)
                balance.balance_start = row.balance_end_real

    def _set_foreign_rescue_closing(self):
        """Count each foreign drawer at its expected balance.

        The rescue close then posts no foreign difference.
        """
        for session in self:
            method = session._get_cash_control_method()
            if not method:
                continue
            for currency in session.config_id.foreign_currency_ids:
                balance = session._get_currency_balance(method, currency, create=True)
                balance.balance_end_real = session._foreign_cash_expected(currency)

    # -------------------------------------------------------------------------
    # Opening, cash in/out, closing counts
    # -------------------------------------------------------------------------

    def _check_pos_user(self):
        """Refuse the call when the user is not a Point of Sale user.

        :raise AccessError: the user is not in the Point of Sale user group
        """
        if not self.env.user.has_group("point_of_sale.group_pos_user"):
            raise AccessError(
                _(
                    "You don't have the access rights to get the "
                    "point of sale closing control data."
                )
            )

    def get_foreign_opening_data(self):
        """Expected opening count of each foreign currency.

        :return: list of currency dicts
        :rtype: list
        """
        self.ensure_one()
        self._check_pos_user()
        method = self._get_cash_control_method()
        previous = self._previous_closed_session()
        result = []
        for currency in self.config_id.foreign_currency_ids:
            expected = 0.0
            if previous and method:
                row = previous._get_currency_balance(method, currency)
                expected = row.balance_end_real if row else 0.0
            result.append(self._foreign_currency_payload(currency, expected))
        return result

    def set_foreign_opening(self, counts):
        """Store the counted opening and post the difference.

        :param list counts: dicts with ``currency_id`` and ``amount``
        :return: True
        :rtype: bool
        :raise UserError: the session is not opening, or the currency is not
            on this Point of Sale
        """
        self.ensure_one()
        self._check_pos_user()
        if self.state != "opening_control":
            raise UserError(
                _(
                    "The foreign opening count is only accepted "
                    "while the session opens."
                )
            )
        method = self._get_cash_control_method()
        if not method:
            return True
        previous = self._previous_closed_session()
        for count in counts:
            currency = self.env["res.currency"].browse(count["currency_id"]).exists()
            if currency not in self.config_id.foreign_currency_ids:
                raise UserError(
                    _(
                        "%(currency)s is not a foreign currency of this Point of Sale.",
                        currency=currency.name,
                    )
                )
            expected = 0.0
            if previous:
                row = previous._get_currency_balance(method, currency)
                expected = row.balance_end_real if row else 0.0
            amount = currency.round(count["amount"])
            balance = self._get_currency_balance(method, currency, create=True)
            balance.balance_start = amount
            already_posted = self._foreign_drawer_move_amount(currency)
            difference = currency.round(amount - expected - already_posted)
            if not currency.is_zero(difference):
                self._post_foreign_cash_difference_line(
                    currency, difference, opening=True
                )
        return True

    def get_foreign_closing_data(self):
        """Expected closing count of each foreign cash and bank tender.

        :return: list of count dicts
        :rtype: list
        """
        self.ensure_one()
        self._check_pos_user()
        result = []
        method = self._get_cash_control_method()
        if method and self.config_id.cash_control:
            for currency in self.config_id.foreign_currency_ids:
                expected = self._foreign_cash_expected(currency)
                payload = self._foreign_currency_payload(currency, expected)
                payload.update(
                    {
                        "payment_method_id": method.id,
                        "payment_method_name": method.name,
                        "type": "cash",
                    }
                )
                result.append(payload)
        orders = self._get_closed_orders()
        bank_methods = self.payment_method_ids.filtered(lambda pm: pm.type == "bank")
        for bank_method in bank_methods:
            currencies = orders.payment_ids.filtered(
                lambda payment, bank_method=bank_method: payment.payment_method_id
                == bank_method
                and payment.foreign_currency_id
            ).foreign_currency_id
            for currency in currencies:
                expected = self._foreign_tender_amount(bank_method, currency)
                payload = self._foreign_currency_payload(currency, expected)
                payload.update(
                    {
                        "payment_method_id": bank_method.id,
                        "payment_method_name": bank_method.name,
                        "type": "bank",
                    }
                )
                result.append(payload)
        return result

    def set_foreign_closing_counts(self, counts):
        """Store counted foreign balances. Posting happens when the session closes.

        :param list counts: dicts with ``payment_method_id``,
            ``currency_id`` and ``amount``
        :return: True
        :rtype: bool
        :raise UserError: the session is closed, or the method or currency does
            not belong to this session
        """
        self.ensure_one()
        self._check_pos_user()
        if self.state == "closed":
            raise UserError(_("This session is already closed."))
        for count in counts:
            method = (
                self.env["pos.payment.method"]
                .browse(count["payment_method_id"])
                .exists()
            )
            currency = self.env["res.currency"].browse(count["currency_id"]).exists()
            if (
                method not in self.payment_method_ids
                or currency not in self.config_id.foreign_currency_ids
            ):
                raise UserError(
                    _("This count does not match a foreign tender of this session.")
                )
            if method.type == "cash" and method != self._get_cash_control_method():
                continue
            balance = self._get_currency_balance(method, currency, create=True)
            balance.balance_end_real = currency.round(count["amount"])
        return True

    def get_foreign_cash_expected(self):
        """Expected foreign cash still in the drawer, keyed by currency id.

        :return: ``{currency_id: amount}``
        :rtype: dict
        """
        self.ensure_one()
        self._check_pos_user()
        return {
            currency.id: self._foreign_cash_expected(currency)
            for currency in self.config_id.foreign_currency_ids
        }

    def _foreign_currency_payload(self, currency, expected):
        """Currency row sent to the opening and closing popups.

        :param currency: ``res.currency`` record
        :param float expected: amount proposed to the cashier
        :return: popup values
        :rtype: dict
        """
        return {
            "currency_id": currency.id,
            "name": currency.name,
            "symbol": currency.symbol,
            "decimal_places": currency.decimal_places,
            "position": currency.position,
            "expected": expected,
            "rate": self._pos_rate(currency),
        }

    def try_cash_in_out(self, _type, amount, reason, extras):
        """Record a cash in or out, in a foreign currency when one is given.

        :param str _type: ``in`` or ``out``
        :param float amount: amount in the chosen currency
        :param str reason: text printed on the statement line
        :param dict extras: ``currency_id`` selects the foreign currency
        :return: result of the Point of Sale cash move
        :raise UserError: the currency is not on this Point of Sale, or
            there is no cash journal
        :raise AccessError: the user is not allowed to record a cash move
        """
        currency_id = extras.get("currency_id") if extras else False
        if not currency_id or currency_id == self.currency_id.id:
            return super().try_cash_in_out(_type, amount, reason, extras)
        currency = self.env["res.currency"].browse(currency_id).exists()
        if currency not in self.config_id.foreign_currency_ids:
            raise UserError(
                _(
                    "%(currency)s is not a foreign currency of this Point of Sale.",
                    currency=currency.display_name,
                )
            )
        sign = 1 if _type == "in" else -1
        date = fields.Date.context_today(self)
        company_amount = currency._convert(
            sign * amount, self.company_id.currency_id, self.company_id, date
        )
        sessions = self.filtered("cash_journal_id")
        if not sessions:
            raise UserError(_("There is no cash payment method for this PoS Session"))
        # Same gate as the cash in/out button. The statement line inherits
        # account.move, which this group can create, so sudo is not required.
        if not self.env.user.has_group("account.group_account_invoice"):
            raise AccessError(_("You are not allowed to put cash in or take it out."))
        self.env["account.bank.statement.line"].create(
            [
                {
                    "pos_session_id": session.id,
                    "journal_id": session.cash_journal_id.id,
                    "amount": company_amount,
                    "amount_currency": sign * amount,
                    "foreign_currency_id": currency.id,
                    "date": date,
                    "payment_ref": "-".join(
                        [session.name, extras["translatedType"], reason]
                    ),
                }
                for session in sessions
            ]
        )

    def _post_foreign_cash_difference_line(self, currency, difference, opening=False):
        """Post one foreign cash difference as a statement line.

        :param currency: ``res.currency`` record
        :param float difference: counted minus expected, in ``currency``
        :param bool opening: opening control rather than closing
        :raise UserError: the cash journal has no loss or profit account
        """
        self.ensure_one()
        if currency.is_zero(difference):
            return
        journal = self.cash_journal_id
        date = fields.Date.context_today(self)
        if difference < 0.0:
            if not journal.loss_account_id:
                raise UserError(
                    _(
                        "Please go on the %(journal)s journal and define a "
                        "Loss Account. This account will be used to record "
                        "cash difference.",
                        journal=journal.name,
                    )
                )
            account = journal.loss_account_id
            label = _("Cash difference observed during the counting (Loss)")
        else:
            if not journal.profit_account_id:
                raise UserError(
                    _(
                        "Please go on the %(journal)s journal and define a "
                        "Profit Account. This account will be used to record "
                        "cash difference.",
                        journal=journal.name,
                    )
                )
            account = journal.profit_account_id
            label = _("Cash difference observed during the counting (Profit)")
        label += _(" - opening") if opening else _(" - closing")
        company_amount = currency._convert(
            difference, self.company_id.currency_id, self.company_id, date
        )
        vals = {
            "journal_id": journal.id,
            "amount": company_amount,
            "amount_currency": difference,
            "foreign_currency_id": currency.id,
            "date": date,
            "pos_session_id": self.id,
            "payment_ref": label,
        }
        if not opening:
            vals["counterpart_account_id"] = account.id
        # Opening control runs as the cashier, who cannot create account.move.
        self.env["account.bank.statement.line"].sudo().create(vals)

    def _check_foreign_difference_accounts(self):
        """Raise before posting when a foreign difference has no loss or profit
        account.

        :raise UserError: the difference journal has no loss or profit account
        """
        self.ensure_one()
        for balance in self._foreign_difference_balances():
            if balance.currency_id.is_zero(balance.difference_balance):
                continue
            journal = self._foreign_difference_journal(balance)
            if balance.difference_balance < 0 and not journal.loss_account_id:
                raise UserError(
                    _(
                        "Please go on the %(journal)s journal and define a "
                        "Loss Account. This account will be used to record "
                        "cash difference.",
                        journal=journal.name,
                    )
                )
            if balance.difference_balance > 0 and not journal.profit_account_id:
                raise UserError(
                    _(
                        "Please go on the %(journal)s journal and define a "
                        "Profit Account. This account will be used to record "
                        "cash difference.",
                        journal=journal.name,
                    )
                )

    def _foreign_difference_journal(self, balance):
        """Journal that posts one foreign closing difference.

        Cash uses the session cash journal. A bank method uses its currency
        difference journal when one is set, otherwise its own journal.

        :param balance: ``pos.session.currency.balance`` record
        :return: ``account.journal`` record
        """
        method = balance.payment_method_id
        if method.type == "cash":
            return self.cash_journal_id
        return method.currency_difference_journal_id or method.journal_id

    def _foreign_difference_balances(self):
        """Balance rows that can post a closing difference.

        :return: ``pos.session.currency.balance`` recordset
        """
        self.ensure_one()
        rows = self.env["pos.session.currency.balance"]
        if self.config_id.cash_control:
            method = self._get_cash_control_method()
            rows |= self.currency_balance_ids.filtered(
                lambda balance: balance.payment_method_id == method
            )
        rows |= self.currency_balance_ids.filtered(
            lambda balance: balance.payment_method_id.type == "bank"
        )
        return rows

    def _post_foreign_closing_differences(self):
        """Post every non-zero foreign closing difference of these sessions."""
        for session in self:
            for balance in session._foreign_difference_balances():
                difference = balance.difference_balance
                if balance.currency_id.is_zero(difference):
                    continue
                if balance.payment_method_id.type == "cash":
                    session._post_foreign_cash_difference_line(
                        balance.currency_id, difference
                    )
                else:
                    session._post_foreign_bank_difference(balance)

    def _prepare_foreign_difference_vals(self, balance):
        """Build the journal entry of a foreign bank closing difference.

        :param balance: ``pos.session.currency.balance`` record
        :return: ``account.move`` create values, or an empty dict when there
            is no difference
        :rtype: dict
        """
        self.ensure_one()
        difference = balance.difference_balance
        currency = balance.currency_id
        if currency.is_zero(difference):
            return {}
        method = balance.payment_method_id
        journal = self._foreign_difference_journal(balance)
        date = fields.Date.context_today(self)
        company_amount = currency._convert(
            difference, self.company_id.currency_id, self.company_id, date
        )
        outstanding = (
            method.outstanding_account_id
            or self.company_id.account_journal_payment_debit_account_id
        )
        # Missing profit and loss accounts are refused before the session
        # move is created. See _check_foreign_difference_accounts.
        if difference > 0:
            counterpart = journal.profit_account_id
        else:
            counterpart = journal.loss_account_id
        return {
            "journal_id": journal.id,
            "date": date,
            "ref": _(
                "Foreign closing difference in %(method)s (%(currency)s, %(session)s)",
                method=method.name,
                currency=currency.name,
                session=self.name,
            ),
            "line_ids": [
                fields.Command.create(
                    {
                        "name": method.name,
                        "account_id": outstanding.id,
                        "currency_id": currency.id,
                        "amount_currency": difference,
                        "debit": company_amount if company_amount > 0 else 0.0,
                        "credit": -company_amount if company_amount < 0 else 0.0,
                    }
                ),
                fields.Command.create(
                    {
                        "name": method.name,
                        "account_id": counterpart.id,
                        "currency_id": currency.id,
                        "amount_currency": -difference,
                        "debit": -company_amount if company_amount < 0 else 0.0,
                        "credit": company_amount if company_amount > 0 else 0.0,
                    }
                ),
            ],
        }

    def _post_foreign_bank_difference(self, balance):
        """Post the journal entry of one foreign bank closing difference.

        :param balance: ``pos.session.currency.balance`` record
        """
        vals = self._prepare_foreign_difference_vals(balance)
        if not vals:
            return
        move = self.env["account.move"].create(vals)
        move._post()
        balance.difference_move_id = move

    # -------------------------------------------------------------------------
    # Session journal entry
    # -------------------------------------------------------------------------

    def _has_foreign_payments(self):
        """Whether a closed order of this session has a foreign tender.

        :return: True when a foreign tender exists
        :rtype: bool
        """
        self.ensure_one()
        return bool(
            self._get_closed_orders().payment_ids.filtered("foreign_currency_id")
        )

    def _missing_exchange_accounts(self):
        """Names of the exchange accounts this company has not set.

        :return: translated setting names
        :rtype: list
        """
        company = self.company_id
        missing = []
        if not company.currency_exchange_journal_id:
            missing.append(_("Exchange Gain or Loss Journal"))
        if not company.income_currency_exchange_account_id:
            missing.append(_("Gain Exchange Rate Account"))
        if not company.expense_currency_exchange_account_id:
            missing.append(_("Loss Exchange Rate Account"))
        return missing

    def _foreign_exchange_message(self):
        """Tell the cashier which exchange accounts are missing.

        :return: error text
        :rtype: str
        """
        return _(
            "Set %(accounts)s before closing this session. "
            "Open Invoicing, Configuration, Settings. In Default Accounts, "
            "fill in Post Exchange difference entries in.",
            accounts=", ".join(self._missing_exchange_accounts()),
        )

    def _check_foreign_exchange_accounts(self):
        """Refuse to close when a foreign tender has no exchange accounts.

        :raise UserError: the exchange journal or an exchange account is empty
        """
        self.ensure_one()
        if self._has_foreign_payments() and self._missing_exchange_accounts():
            raise UserError(self._foreign_exchange_message())

    def _cannot_close_session(self, bank_payment_method_diffs=None):
        """Refuse a UI close when a foreign tender has no exchange accounts.

        :param dict bank_payment_method_diffs: core bank differences
        :return: failure payload, or a falsy value when the session can close
        """
        result = super()._cannot_close_session(bank_payment_method_diffs)
        if result:
            return result
        if self._has_foreign_payments() and self._missing_exchange_accounts():
            return {
                "successful": False,
                "message": self._foreign_exchange_message(),
                "redirect": False,
            }
        return result

    def _get_foreign_payment_date(self, payment):
        """Date used to convert one foreign tender.

        :param payment: ``pos.payment`` record
        :return: date
        :rtype: date
        """
        self.ensure_one()
        return fields.Date.context_today(self, timestamp=payment.payment_date)

    def _accumulate_amounts(self, data):
        """Accumulate session amounts, moving foreign tenders into their groups.

        :param dict data: accumulation dict from core
        :return: accumulation dict with ``foreign_payment_groups``
        :rtype: dict
        :raise UserError: a foreign tender has no exchange accounts
        """
        self._check_foreign_exchange_accounts()
        data = super()._accumulate_amounts(data)
        groups = self._collect_foreign_payment_groups()
        for group in groups:
            for payment in group["payments"]:
                self._subtract_foreign_payment(data, payment)
        data["foreign_payment_groups"] = groups
        return data

    def _collect_foreign_payment_groups(self):
        """Group foreign tenders by method, currency and payment day.

        Split methods stay one group per payment. A customer module can
        override this to change the grouping only.

        :return: list of group dicts
        :rtype: list
        """
        self.ensure_one()
        buckets = {}
        payments = self._get_closed_orders().payment_ids.filtered("foreign_currency_id")
        for payment in payments:
            if self.currency_id.is_zero(payment.amount):
                continue
            method = payment.payment_method_id
            currency = payment.foreign_currency_id
            payment_date = self._get_foreign_payment_date(payment)
            if method.split_transactions:
                key = ("split", payment.id)
                partner = self.env["res.partner"]._find_accounting_partner(
                    payment.partner_id
                )
            else:
                key = ("combine", method.id, currency.id, payment_date)
                partner = self.env["res.partner"]
            group = buckets.get(key)
            if not group:
                group = {
                    "method": method,
                    "currency": currency,
                    "date": payment_date,
                    "amount": 0.0,
                    "amount_currency": 0.0,
                    "split": bool(method.split_transactions),
                    "payment": payment
                    if method.split_transactions
                    else self.env["pos.payment"],
                    "payments": self.env["pos.payment"],
                    "partner": partner,
                    "type": method.type,
                }
                buckets[key] = group
            group["amount"] += payment.amount
            group["amount_currency"] += payment.amount_currency
            group["payments"] |= payment
        for group in buckets.values():
            group["amount"] = self.currency_id.round(group["amount"])
            group["amount_currency"] = group["currency"].round(group["amount_currency"])
        return list(buckets.values())

    def _subtract_foreign_payment(self, data, payment):
        """Remove one foreign tender from the Point of Sale currency groups.

        Invoice groups are left in the Point of Sale currency: they reconcile
        with the invoice payment, which core books from ``payment.amount``.

        :param dict data: accumulation dict
        :param payment: ``pos.payment`` record
        """
        method = payment.payment_method_id
        if method.split_transactions and method.type == "cash":
            bucket = data["split_receivables_cash"]
            key = payment
        elif not method.split_transactions and method.type == "cash":
            bucket = data["combine_receivables_cash"]
            key = method
        elif method.split_transactions and method.type == "bank":
            bucket = data["split_receivables_bank"]
            key = payment
        elif not method.split_transactions and method.type == "bank":
            bucket = data["combine_receivables_bank"]
            key = method
        else:
            return
        if key not in bucket:
            return
        if method.split_transactions:
            bucket.pop(key)
            return
        bucket[key] = self._update_amounts(
            bucket[key], {"amount": -payment.amount}, payment.payment_date
        )
        if float_is_zero(
            bucket[key]["amount"], precision_rounding=self.currency_id.rounding
        ):
            bucket.pop(key)

    def _foreign_receivable_account(self, group):
        """Receivable that a foreign tender is reconciled on.

        :param dict group: foreign payment group
        :return: ``account.account`` record
        """
        self.ensure_one()
        if group["split"]:
            return group["partner"].property_account_receivable_id
        return self._get_receivable_account(group["method"])

    def _prepare_foreign_receivable_vals(self, group):
        """Session receivable line for one foreign tender group.

        The company-currency balance is the sum of the Point of Sale amounts.
        The amount in currency is the tender. Reconciliation posts the gap
        against the company-rate value of the tender.

        :param dict group: foreign payment group
        :return: ``account.move.line`` values
        :rtype: dict
        """
        self.ensure_one()
        currency = group["currency"]
        amount = group["amount"]
        name = f"{self.name} - {group['method'].name}"
        account = self._foreign_receivable_account(group)
        partner = group["partner"] if group["split"] else self.env["res.partner"]
        return {
            "account_id": account.id,
            "move_id": self.move_id.id,
            "name": name,
            "partner_id": partner.id or False,
            "currency_id": currency.id,
            "amount_currency": group["amount_currency"],
            "debit": amount if amount > 0.0 else 0.0,
            "credit": -amount if amount < 0.0 else 0.0,
        }

    def _prepare_foreign_statement_line_vals(self, group):
        """Cash statement line for one foreign tender group.

        ``amount`` is the tender converted at the company rate of the payment
        day. ``amount_currency`` is the tender itself.

        :param dict group: foreign payment group
        :return: ``account.bank.statement.line`` values
        :rtype: dict
        """
        self.ensure_one()
        currency = group["currency"]
        company_amount = currency._convert(
            group["amount_currency"],
            self.company_id.currency_id,
            self.company_id,
            group["date"],
        )
        if group["split"]:
            account = group["partner"].property_account_receivable_id
            payment_ref = group["payment"].name
            partner = group["partner"]
        else:
            account = self._get_receivable_account(group["method"])
            payment_ref = self.name
            partner = self.env["res.partner"]
        vals = {
            "date": group["date"],
            "amount": company_amount,
            "amount_currency": group["amount_currency"],
            "foreign_currency_id": currency.id,
            "payment_ref": payment_ref,
            "pos_session_id": self.id,
            "journal_id": group["method"].journal_id.id,
            "counterpart_account_id": account.id,
        }
        if partner:
            vals["partner_id"] = partner.id
        return vals

    def _prepare_foreign_account_payment_vals(self, group):
        """Bank payment for one foreign tender group.

        The currency is the tender currency. ``account.payment.create`` rebuilds
        the journal items from that currency, so the value is written before
        the lines exist when the journal currency would otherwise win.

        :param dict group: foreign payment group
        :return: ``account.payment`` values
        :rtype: dict
        """
        self.ensure_one()
        method = group["method"]
        outstanding = (
            method.outstanding_account_id
            or self.company_id.account_journal_payment_debit_account_id
        )
        if group["split"]:
            destination = group["partner"].property_account_receivable_id
            ref = _(
                "%(method)s POS payment of %(partner)s in %(session)s",
                method=method.name,
                partner=group["partner"].display_name,
                session=self.name,
            )
        else:
            destination = self._get_receivable_account(method)
            ref = _(
                "Combine %(method)s POS payments from %(session)s",
                method=method.name,
                session=self.name,
            )
        amount = group["amount_currency"]
        if group["currency"].compare_amounts(amount, 0) < 0:
            outstanding, destination = destination, outstanding
        vals = {
            "amount": abs(amount),
            "date": group["date"],
            "journal_id": method.journal_id.id,
            "currency_id": group["currency"].id,
            "force_outstanding_account_id": outstanding.id,
            "destination_account_id": destination.id,
            "ref": ref,
            "pos_payment_method_id": method.id,
            "pos_session_id": self.id,
            "company_id": self.company_id.id,
        }
        if group["split"]:
            vals["partner_id"] = group["partner"].id
        return vals

    def _create_foreign_account_payment(self, group):
        """Create and post the bank payment of one foreign group.

        :param dict group: foreign payment group
        :return: receivable line to reconcile with the session
        :rtype: account.move.line
        """
        vals = self._prepare_foreign_account_payment_vals(group)
        context = {"pos_payment": True} if not group["split"] else {}
        payment = self.env["account.payment"].with_context(**context).create(vals)
        if payment.currency_id != group["currency"] or payment.date != group["date"]:
            payment.write({"currency_id": group["currency"].id, "date": group["date"]})
        payment.action_post()
        # The receivable stays put. A negative tender swaps the payment
        # accounts, so that debit is on outstanding_account_id, not on
        # destination_account_id.
        receivable = self._foreign_receivable_account(group)
        return payment.move_id.line_ids.filtered(
            lambda line: line.account_id == receivable
        )

    def _create_bank_payment_moves(self, data):
        """Create bank moves, then book and reconcile each foreign bank group.

        :param dict data: accumulation dict
        :return: accumulation dict
        :rtype: dict
        """
        data = super()._create_bank_payment_moves(data)
        MoveLine = data["MoveLine"]
        for group in data.get("foreign_payment_groups") or []:
            if group["type"] != "bank":
                continue
            if group["currency"].is_zero(group["amount_currency"]):
                continue
            payment_line = self._create_foreign_account_payment(group)
            receivable_vals = self._prepare_foreign_receivable_vals(group)
            receivable_line = MoveLine.create(receivable_vals)
            lines = receivable_line | payment_line
            if group["split"]:
                existing = data["payment_to_receivable_lines"].get(
                    group["payment"], self.env["account.move.line"]
                )
                data["payment_to_receivable_lines"][group["payment"]] = existing | lines
            else:
                existing = data["payment_method_to_receivable_lines"].get(
                    group["method"], self.env["account.move.line"]
                )
                data["payment_method_to_receivable_lines"][group["method"]] = (
                    existing | lines
                )
        return data

    def _create_cash_statement_lines_and_cash_move_lines(self, data):
        """Create cash statement lines, then book each foreign cash group.

        :param dict data: accumulation dict
        :return: accumulation dict
        :rtype: dict
        """
        data = super()._create_cash_statement_lines_and_cash_move_lines(data)
        MoveLine = data["MoveLine"]
        statement_model = self.env["account.bank.statement.line"]
        receivable_lines = self.env["account.move.line"]
        statement_lines = statement_model
        for group in data.get("foreign_payment_groups") or []:
            if group["type"] != "cash":
                continue
            if group["currency"].is_zero(group["amount_currency"]):
                continue
            statement_lines |= statement_model.create(
                self._prepare_foreign_statement_line_vals(group)
            )
            receivable_lines |= MoveLine.create(
                self._prepare_foreign_receivable_vals(group)
            )
        counterparts = statement_lines.move_id.line_ids.filtered(
            lambda line: line.account_id.account_type == "asset_receivable"
        )
        data["combine_cash_statement_lines"] |= counterparts
        data["combine_cash_receivable_lines"] |= receivable_lines
        return data

    def _get_related_account_moves(self):
        """Journal items of this session, including exchange and bank differences.

        :return: ``account.move`` recordset
        """
        moves = super()._get_related_account_moves()
        session_moves = (
            self.move_id
            | self.statement_line_ids.move_id
            | self.bank_payment_ids.move_id
        )
        lines = session_moves.line_ids
        if not lines:
            return moves | self.currency_balance_ids.difference_move_id
        partials = self.env["account.partial.reconcile"].search(
            [
                "|",
                ("debit_move_id", "in", lines.ids),
                ("credit_move_id", "in", lines.ids),
            ]
        )
        exchange = partials.exchange_move_id | lines.full_reconcile_id.exchange_move_id
        exchange |= self.currency_balance_ids.difference_move_id
        return moves | exchange

    # -------------------------------------------------------------------------
    # POS load
    # -------------------------------------------------------------------------

    def _pos_data_process(self, loaded_data):
        """Attach foreign currencies and the cash-control method to the POS load.

        :param dict loaded_data: Point of Sale load payload
        :return: result of the core process
        """
        result = super()._pos_data_process(loaded_data)
        loaded_data["pos.foreign.currency"] = self._get_pos_ui_foreign_currencies()
        loaded_data["pos_cash_control_method_id"] = self._get_cash_control_method().id
        return result

    def _get_pos_ui_foreign_currencies(self):
        """Currencies the cashier can select on a payment line.

        A customer module overrides this to add data. It must not replace the
        single ``res.currency`` dict core loads for the Point of Sale currency.

        :return: list of currency dicts
        :rtype: list
        """
        self.ensure_one()
        result = []
        for currency in self.config_id.foreign_currency_ids:
            result.append(
                {
                    "id": currency.id,
                    "name": currency.name,
                    "symbol": currency.symbol,
                    "position": currency.position,
                    "rounding": currency.rounding,
                    "decimal_places": currency.decimal_places,
                    "rate": self._pos_rate(currency),
                }
            )
        return result
