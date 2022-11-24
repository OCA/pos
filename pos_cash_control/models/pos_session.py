# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from collections import defaultdict

from odoo import _, fields, models
from odoo.exceptions import AccessError, UserError
from odoo.tools import float_compare, float_is_zero


class PosSession(models.Model):
    _inherit = "pos.session"

    opening_notes = fields.Text(string="Opening Notes")

    def try_cash_in_out(self, _type, amount, reason, extras):
        sign = 1 if _type == "in" else -1
        sessions = self.filtered("cash_journal_id")
        if not sessions:
            raise UserError(_("There is no cash payment method for this PoS Session"))

        self.env["account.bank.statement.line"].create(
            [
                {
                    "journal_id": session.cash_journal_id.id,
                    "amount": sign * amount,
                    "date": fields.Date.context_today(self),
                    "payment_ref": "-".join(
                        [session.name, extras["translatedType"], reason]
                    ),
                    "statement_id": self._get_statement_id(session),
                }
                for session in sessions
            ]
        )

        message_content = [
            f"Cash {extras['translatedType']}",
            f'- Amount: {extras["formattedAmount"]}',
        ]
        if reason:
            message_content.append(f"- Reason: {reason}")
        self.message_post(body="<br/>\n".join(message_content))

    def _get_statement_id(self, session):
        return (
            self.env["account.bank.statement"]
            .search(
                [
                    ("journal_id", "=", session.cash_journal_id.id),
                    ("pos_session_id", "=", session.id),
                ]
            )
            .id
        )

    def get_closing_control_data(self):
        self.ensure_one()
        orders = self.order_ids.filtered(
            lambda o: o.state == "paid" or o.state == "invoiced"
        )
        payments = orders.payment_ids.search([])
        cash_payment_method_ids = self.payment_method_ids.filtered(
            lambda pm: pm.is_cash_count
        )
        default_cash_payment_method_id = (
            cash_payment_method_ids[0] if cash_payment_method_ids else None
        )
        total_default_cash_payment_amount = (
            sum(
                payments.filtered(
                    lambda p: p.payment_method_id == default_cash_payment_method_id
                ).mapped("amount")
            )
            if default_cash_payment_method_id
            else 0
        )
        other_payment_method_ids = (
            self.payment_method_ids - default_cash_payment_method_id
            if default_cash_payment_method_id
            else self.payment_method_ids
        )
        cash_in_count = 0
        cash_out_count = 0
        cash_in_out_list = []
        for cash_move in self.cash_register_id.line_ids.sorted("create_date"):
            if cash_move.amount > 0:
                cash_in_count += 1
                name = f"Cash in {cash_in_count}"
            else:
                cash_out_count += 1
                name = f"Cash out {cash_out_count}"
            cash_in_out_list.append(
                {
                    "name": cash_move.payment_ref if cash_move.payment_ref else name,
                    "amount": cash_move.amount,
                }
            )

        return {
            "orders_details": {
                "quantity": len(orders),
                "amount": sum(orders.mapped("amount_total")),
            },
            "payments_amount": sum(payments.mapped("amount")),
            "opening_notes": self.opening_notes,
            "default_cash_details": {
                "name": default_cash_payment_method_id.name,
                "amount": self.cash_register_id.balance_start
                + total_default_cash_payment_amount
                + sum(self.cash_register_id.line_ids.mapped("amount")),
                "opening": self.cash_register_id.balance_start,
                "payment_amount": total_default_cash_payment_amount,
                "moves": cash_in_out_list,
                "id": default_cash_payment_method_id.id,
            }
            if default_cash_payment_method_id
            else None,
            "other_payment_methods": [
                {
                    "name": pm.name,
                    "amount": sum(
                        orders.payment_ids.filtered(
                            lambda p: p.payment_method_id == pm
                        ).mapped("amount")
                    ),
                    "number": len(
                        orders.payment_ids.filtered(lambda p: p.payment_method_id == pm)
                    ),
                    "id": pm.id,
                    "is_cash_count": pm.is_cash_count,
                }
                for pm in other_payment_method_ids
            ],
            "is_manager": self.user_has_groups("point_of_sale.group_pos_manager"),
            "amount_authorized_diff": self.config_id.amount_authorized_diff
            if self.config_id.set_maximum_difference
            else None,
        }

    def post_closing_cash_details(self, counted_cash):
        """
        Calling this method will try store the cash details during the session closing.

        :param counted_cash: float, the total cash the user counted from its cash register
        If successful, it returns {'successful': True}
        Otherwise, it returns {'successful': False, 'message': str, 'redirect': bool}.
        'redirect' is a boolean used to know whether we redirect the user to the back end
        or not.
        When necessary, error (i.e. UserError, AccessError) is raised which should redirect
        the user to the backend.
        """
        self.ensure_one()
        check_closing_session = self._cannot_close_session()
        if check_closing_session:
            return check_closing_session

        if not self.cash_register_id:
            # The user is blocked anyway, this user error is mostly for developers that
            # try to call this function
            raise UserError(_("There is no cash register in this session."))

        self.cash_register_id.balance_end_real = counted_cash

        return {"successful": True}

    def _cannot_close_session(self, bank_payment_method_diffs=None):
        """
        Add check in this method if you want to return or raise an error when trying to
        either post cash details
        or close the session. Raising an error will always redirect the user to the back end.
        It should return {'successful': False, 'message': str, 'redirect': bool} if we
        can't close the session
        """
        bank_payment_method_diffs = bank_payment_method_diffs or {}
        if any(order.state == "draft" for order in self.order_ids):
            return {
                "successful": False,
                "message": _(
                    "You cannot close the POS wehn orders are still in draft."
                ),
                "redirect": False,
            }
        if self.state == "closed":
            return {
                "successful": False,
                "message": _("This session is already closed."),
                "redirect": True,
            }
        if bank_payment_method_diffs:
            no_loss_account = self.env["account.journal"]
            no_profit_account = self.env["account.journal"]
            for payment_method in self.env["pos.payment.method"].browse(
                bank_payment_method_diffs.keys()
            ):
                journal = payment_method.cash_journal_id
                compare_to_zero = self.currency_id.compare_amounts(
                    bank_payment_method_diffs.get(payment_method.id), 0
                )
                if compare_to_zero == -1 and not journal.loss_account_id:
                    no_loss_account |= journal
                elif compare_to_zero == 1 and not journal.profit_account_id:
                    no_profit_account |= journal
            message = ""
            if no_loss_account:
                message += _(
                    "Need loss account for the following journals "
                    + "to post the lost amount: %s\n",
                    ", ".join(no_loss_account.mapped("name")),
                )
            if no_profit_account:
                message += _(
                    "Need proft account for the following journals "
                    + "to post the gained amount: %s\n",
                    ", ".join(no_profit_account.mapped("name")),
                )
            if message:
                return {"successful": False, "message": message, "redirect": False}

    def update_closing_control_state_session(self, notes):
        # Prevent the session to be opened again
        self.write({"state": "closing_control", "stop_at": fields.Datetime.now()})
        self._post_cash_details_message("Closing", self.cash_register_difference, notes)

    def _post_cash_details_message(self, state, difference, notes):
        message = ""
        if difference:
            message = (
                f"{state} difference: "
                f"{self.currency_id.symbol + ' ' if self.currency_id.position == 'before' else ''}"  # noqa
                f"{self.currency_id.round(difference)} "
                f"{self.currency_id.symbol if self.currency_id.position == 'after' else ''}<br/>"  # noqa
            )
        if notes:
            message += notes.replace("\n", "<br/>")
        if message:
            self.env["mail.message"].create(
                {
                    "body": message,
                    "model": "account.bank.statement",
                    "res_id": self.cash_register_id.id,
                }
            )
            self.message_post(body=message)

    def close_session_from_ui(self, bank_payment_method_diff_pairs=None):
        """Calling this method will try to close the session.

        param bank_payment_method_diff_pairs: list[(int, float)]
            Pairs or payment_method_id and diff_amount which will be used to post
            loss/profit when closing the session.

        If successful, it returns {"successful": True}
        Otherwise, it returns {"successful": False, "message": str, "redirect": bool}
        "redirect" is a boolean used to know whether we redirect the user to the
        back-end or not.
        When necessary, error (i.e. UserError, AccessError) is raised which should
        redirect the user to the back-end.
        """
        bank_payment_method_diffs = dict(bank_payment_method_diff_pairs or [])
        self.ensure_one()
        # Even if is called in `post_closing_cash_details`, we need to call this
        # here too for case
        # where cash_control = False
        check_closing_session = self._cannot_close_session(bank_payment_method_diffs)
        if check_closing_session:
            return check_closing_session

        # For now we won't simply do
        # self._check_pos_session_balance()
        # self._check_bank_statement_state()
        # validate_result = self._validate_session()
        # because some functions are being used and overridden in other modules...
        # so we'll try to use the original flow as of now for the moment
        validate_result = self.action_pos_session_closing_control(
            bank_payment_method_diffs=bank_payment_method_diffs
        )

        # If an error is raised, the user will still be redirected to the back-end
        # to manually close the session.
        # If the return result is a dict, this means that normally we have a
        # redirection or a wizard => we redirect the user
        if isinstance(validate_result, dict):
            # imbalance accounting entry
            return {
                "successful": False,
                "message": validate_result.get("name"),
                "redirect": True,
            }

        self.message_post(body=_("Point of Sale Session ended."))

        return {"successful": True}

    def action_pos_session_closing_control(
        self,
        balancing_account=False,
        amount_to_balance=0,
        bank_payment_method_diffs=None,
    ):
        bank_payment_method_diffs = bank_payment_method_diffs or {}
        self._check_pos_session_balance()
        for session in self:
            if any(order.state == "draft" for order in session.order_ids):
                raise UserError(
                    _("You cannot close the POS when orders are still in draft")
                )
            if session.state == "closed":
                raise UserError(_("This session is already closed."))
            session.write(
                {"state": "closing_control", "stop_at": fields.Datetime.now()}
            )
            if not session.config_id.cash_control:
                return session.action_pos_session_close(
                    balancing_account, amount_to_balance, bank_payment_method_diffs
                )
            # If the session is in rescue, we only compute the payments in the cash
            # register
            # It is not yet possible to close a rescue session through the front end,
            # see `close_session_from_ui`
            if session.rescue and session.config_id.cash_control:
                default_cash_payment_method_id = self.payment_method_ids.filtered(
                    lambda pm: pm.is_cash_count
                )[0]
                orders = self.order_ids.filtered(
                    lambda o: o.state == "paid" or o.state == "invoiced"
                )
                total_cash = (
                    sum(
                        orders.payment_ids.filtered(
                            lambda p: p.payment_method_id
                            == default_cash_payment_method_id
                        ).mapped("amount")
                    )
                    + self.cash_register_balance_start
                )

                session.cash_register_id.balance_end_real = total_cash

            return session.action_pos_session_validate(
                balancing_account, amount_to_balance, bank_payment_method_diffs
            )

    # @override
    def action_pos_session_validate(
        self,
        balancing_account=False,
        amount_to_balance=0,
        bank_payment_method_diffs=None,
    ):
        bank_payment_method_diffs = bank_payment_method_diffs or {}
        self._check_pos_session_balance()
        return self.action_pos_session_close(
            balancing_account, amount_to_balance, bank_payment_method_diffs
        )

    # @override
    def action_pos_session_close(
        self,
        balancing_account=False,
        amount_to_balance=0,
        bank_payment_method_diffs=None,
    ):
        bank_payment_method_diffs = bank_payment_method_diffs or {}
        # Session without cash payment method will not have a cash register.
        # However, there could be other payment methods, thus, session still
        # needs to be validated.
        self._check_bank_statement_state()
        return self._validate_session(
            balancing_account, amount_to_balance, bank_payment_method_diffs
        )

    # @override
    def _validate_session(
        self,
        balancing_account=False,
        amount_to_balance=0,
        bank_payment_method_diffs=None,
    ):
        if not self.state == "closed":
            bank_payment_method_diffs = bank_payment_method_diffs or {}
            self.ensure_one()
            sudo = self.user_has_groups("point_of_sale.group_pos_user")
            if self.order_ids or self.statement_ids.line_ids:
                self.cash_real_transaction = self.cash_register_total_entry_encoding
                self.cash_real_expected = self.cash_register_balance_end
                self.cash_real_difference = self.cash_register_difference
                self._check_if_no_draft_orders()
                self._check_invoices_are_posted()
                if self.update_stock_at_closing:
                    self._create_picking_at_end_of_session()
                    self.order_ids.filtered(
                        lambda o: not o.is_total_cost_computed
                    )._compute_total_cost_at_session_closing(
                        self.picking_ids.move_lines
                    )
                try:
                    data = self.with_company(self.company_id)._create_account_move(
                        balancing_account, amount_to_balance, bank_payment_method_diffs
                    )
                except AccessError as e:
                    if sudo:
                        data = (
                            self.sudo()
                            .with_company(self.company_id)
                            ._create_account_move(
                                balancing_account,
                                amount_to_balance,
                                bank_payment_method_diffs,
                            )
                        )
                    else:
                        raise e

                try:
                    balance = sum(self.move_id.line_ids.mapped("balance"))
                    self.move_id._check_balanced()
                except UserError:
                    # Creating the account move is just part of a big database
                    # transaction
                    # when closing a session. There are other database changes
                    # that will happen
                    # before attempting to create the account move, such as,
                    # creating the picking
                    # records.
                    # We don't, however, want them to be committed when the
                    # account move creation
                    # failed; therefore, we need to roll back this transaction
                    # before showing the
                    # close session wizard.
                    self.env.cr.rollback()
                    return self._close_session_action(balance)

                if self.move_id.line_ids:
                    self.move_id.sudo().with_company(self.company_id)._post()
                    # Set the uninvoiced orders' state to 'done'
                    self.env["pos.order"].search(
                        [("session_id", "=", self.id), ("state", "=", "paid")]
                    ).write({"state": "done"})
                else:
                    self.move_id.sudo().unlink()
                self.sudo().with_company(self.company_id)._reconcile_account_move_lines(
                    data
                )
            else:
                statement = self.cash_register_id
                if not self.config_id.cash_control:
                    statement.write({"balance_end_real": statement.balance_end})
                statement.button_post()
                statement.button_validate()
            self.write({"state": "closed"})
            return True

    def _close_session_action(self, amount_to_balance):
        # NOTE This can't handle `bank_payment_method_diffs` because there is
        # no field in the wizard that can carry it.
        default_account = self._get_balancing_account()
        wizard = self.env["pos.close.session.wizard"].create(
            {
                "amount_to_balance": amount_to_balance,
                "account_id": default_account.id,
                "account_readonly": not self.env.user.has_group(
                    "account.group_account_readonly"
                ),
                "message": _(
                    "There is a difference between the amounts to post and "
                    + "the amounts of the orders, it is probably caused by "
                    + "taxes or accounting configurations changes."
                ),
            }
        )
        return {
            "name": _("Force Close Session"),
            "type": "ir.actions.act_window",
            "view_type": "form",
            "view_mode": "form",
            "res_model": "pos.close.session.wizard",
            "res_id": wizard.id,
            "target": "new",
            "context": {
                **self.env.context,
                "active_ids": self.ids,
                "active_model": "pos.session",
            },
        }

    # @override
    def _create_account_move(
        self,
        balancing_account=False,
        amount_to_balance=0,
        bank_payment_method_diffs=None,
    ):
        """Create account.move and account.move.line records for this session.
        Side-effects include:
            - setting self.move_id to the created account.move record
            - creating and validating account.bank.statement for cash payments
            - reconciling cash receivable lines, invoice receivable lines and stock output lines
        """
        journal = self.config_id.journal_id
        # Passing default_journal_id for the calculation of default currency of account move
        # See _get_default_currency in the account/account_move.py.
        account_move = (
            self.env["account.move"]
            .with_context(default_journal_id=journal.id)
            .create(
                {
                    "journal_id": journal.id,
                    "date": fields.Date.context_today(self),
                    "ref": self.name,
                }
            )
        )
        self.write({"move_id": account_move.id})

        data = {"bank_payment_method_diffs": bank_payment_method_diffs or {}}
        data = self._accumulate_amounts(data)
        data = self._create_non_reconciliable_move_lines(data)
        data = self._create_bank_payment_moves(data)
        data = self._create_cash_statement_lines_and_cash_move_lines(data)
        data = self._create_invoice_receivable_lines(data)
        data = self._create_stock_output_lines(data)
        if balancing_account and amount_to_balance:
            data = self._create_balancing_line(
                data, balancing_account, amount_to_balance
            )

        return data

    def _accumulate_amounts(self, data):
        res = super(PosSession, self)._accumulate_amounts(data)
        amounts = lambda: {"amount": 0.0, "amount_converted": 0.0}  # noqa
        split_receivables_bank = defaultdict(amounts)
        combine_receivables_bank = defaultdict(amounts)
        combine_invoice_receivables = defaultdict(amounts)
        split_invoice_receivables = defaultdict(amounts)
        combine_inv_payment_receivable_lines = defaultdict(
            lambda: self.env["account.move.line"]
        )
        split_inv_payment_receivable_lines = defaultdict(
            lambda: self.env["account.move.line"]
        )

        currency_rounding = self.currency_id.rounding
        pos_receivable_account = (
            self.company_id.account_default_pos_receivable_account_id
        )

        for order in self.order_ids:
            order_is_invoiced = order.is_invoiced
            for payment in order.payment_ids:
                amount = payment.amount
                if float_is_zero(amount, precision_rounding=currency_rounding):
                    continue
                date = payment.payment_date
                payment_method = payment.payment_method_id
                is_split_payment = payment.payment_method_id.split_transactions
                if is_split_payment and not payment_method.is_cash_count:
                    split_receivables_bank[payment] = self._update_amounts(
                        split_receivables_bank[payment], {"amount": amount}, date
                    )
                elif not is_split_payment and not payment_method.is_cash_count:
                    combine_receivables_bank[payment_method] = self._update_amounts(
                        combine_receivables_bank[payment_method],
                        {"amount": amount},
                        date,
                    )

                # Create the vals to create the pos receivables that will
                # balance the pos receivables from invoice payment moves.
                if order_is_invoiced:
                    if is_split_payment:
                        split_inv_payment_receivable_lines[
                            payment
                        ] |= payment.account_move_id.line_ids.filtered(
                            lambda line: line.account_id == pos_receivable_account
                        )
                        split_invoice_receivables[payment] = self._update_amounts(
                            split_invoice_receivables[payment],
                            {"amount": payment.amount},
                            order.date_order,
                        )
                    else:
                        combine_inv_payment_receivable_lines[
                            payment_method
                        ] |= payment.account_move_id.line_ids.filtered(
                            lambda line: line.account_id == pos_receivable_account
                        )
                        combine_invoice_receivables[
                            payment_method
                        ] = self._update_amounts(
                            combine_invoice_receivables[payment_method],
                            {"amount": payment.amount},
                            order.date_order,
                        )

        res["split_receivables_bank"] = split_receivables_bank
        res["combine_receivables_bank"] = combine_receivables_bank
        res["combine_invoice_receivables"] = combine_invoice_receivables
        res["split_invoice_receivables"] = split_invoice_receivables
        res[
            "combine_inv_payment_receivable_lines"
        ] = combine_inv_payment_receivable_lines
        res["split_inv_payment_receivable_lines"] = split_inv_payment_receivable_lines
        return res

    def _create_bank_payment_moves(self, data):
        combine_receivables_bank = data.get("combine_receivables_bank")
        split_receivables_bank = data.get("split_receivables_bank")
        bank_payment_method_diffs = data.get("bank_payment_method_diffs")
        MoveLine = data.get("MoveLine")
        payment_method_to_receivable_lines = {}
        payment_to_receivable_lines = {}
        for payment_method, amounts in combine_receivables_bank.items():
            combine_receivable_line = MoveLine.create(
                self._get_combine_receivable_vals(
                    payment_method, amounts["amount"], amounts["amount_converted"]
                )
            )
            MoveLine.create(
                self._prepare_balancing_line_vals(
                    amounts["amount"],
                    self.move_id,
                    payment_method.receivable_account_id,
                )
            )
            payment_receivable_line = self._create_combine_account_payment(
                payment_method,
                amounts,
                diff_amount=bank_payment_method_diffs.get(payment_method.id) or 0,
            )
            payment_method_to_receivable_lines[payment_method] = (
                combine_receivable_line | payment_receivable_line
            )

        for payment, amounts in split_receivables_bank.items():
            split_receivable_line = MoveLine.create(
                self._get_split_receivable_vals(
                    payment, amounts["amount"], amounts["amount_converted"]
                )
            )
            payment_receivable_line = self._create_split_account_payment(
                payment, amounts
            )
            payment_to_receivable_lines[payment] = (
                split_receivable_line | payment_receivable_line
            )

        for bank_payment_method in self.payment_method_ids.filtered(
            lambda pm: pm.is_cash_count and pm.split_transactions
        ):
            self._create_diff_account_move_for_split_payment_method(
                bank_payment_method,
                bank_payment_method_diffs.get(bank_payment_method.id) or 0,
            )

        data["payment_method_to_receivable_lines"] = payment_method_to_receivable_lines
        data["payment_to_receivable_lines"] = payment_to_receivable_lines
        return data

    # @override
    def _create_balancing_line(self, data, balancing_account, amount_to_balance):
        if not float_is_zero(
            amount_to_balance, precision_rounding=self.currency_id.rounding
        ):
            balancing_vals = self._prepare_balancing_line_vals(
                amount_to_balance, self.move_id, balancing_account
            )
            MoveLine = data.get("MoveLine")
            MoveLine.create(balancing_vals)
        return data

    def _create_split_account_payment(self, payment, amounts):
        payment_method = payment.payment_method_id
        if not payment_method.journal_id:
            return self.env["account.move.line"]
        outstanding_account = (
            payment_method.outstanding_account_id
            or self.company_id.account_journal_payment_debit_account_id
        )
        accounting_partner = self.env["res.partner"]._find_accounting_partner(
            payment.partner_id
        )
        destination_account = accounting_partner.property_account_receivable_id

        if (
            float_compare(
                amounts["amount"], 0, precision_rounding=self.currency_id.rounding
            )
            < 0
        ):
            # revert the accounts because account.payment doesn't accept negative amount.
            outstanding_account, destination_account = (
                destination_account,
                outstanding_account,
            )

        account_payment = self.env["account.payment"].create(
            {
                "amount": abs(amounts["amount"]),
                "partner_id": payment.partner_id.id,
                "journal_id": payment_method.journal_id.id,
                "force_outstanding_account_id": outstanding_account.id,
                "destination_account_id": destination_account.id,
                "ref": _("%s POS payment of %s in %s")
                % (payment_method.name, payment.partner_id.display_name, self.name),
                "pos_payment_method_id": payment_method.id,
                "pos_session_id": self.id,
            }
        )
        account_payment.action_post()
        return account_payment.move_id.line_ids.filtered(
            lambda line: line.account_id == account_payment.destination_account_id
        )

    # @override
    def _prepare_balancing_line_vals(self, imbalance_amount, move, balancing_account):
        partial_vals = {
            "name": _("Difference at closing PoS session"),
            "account_id": balancing_account.id,
            "move_id": move.id,
            "partner_id": False,
        }
        # `imbalance_amount` is already in terms of company currency so it is
        # the amount_converted
        # param when calling `_credit_amounts`. amount param will be the converted value of
        # `imbalance_amount` from company currency to the session currency.
        imbalance_amount_session = 0
        if not self.is_in_company_currency:
            imbalance_amount_session = self.company_id.currency_id._convert(
                imbalance_amount,
                self.currency_id,
                self.company_id,
                fields.Date.context_today(self),
            )
        return self._credit_amounts(
            partial_vals, imbalance_amount_session, imbalance_amount
        )

    def _create_combine_account_payment(self, payment_method, amounts, diff_amount):
        outstanding_account = (
            payment_method.outstanding_account_id
            or self.company_id.account_journal_payment_debit_account_id
        )
        destination_account = (
            payment_method.receivable_account_id
            or self.company_id.account_default_pos_receivable_account_id
        )

        if (
            float_compare(
                amounts["amount"], 0, precision_rounding=self.currency_id.rounding
            )
            < 0
        ):
            # revert the accounts because account.payment doesn't accept negative amount.
            outstanding_account, destination_account = (
                destination_account,
                outstanding_account,
            )

        account_payment = self.env["account.payment"].create(
            {
                "amount": abs(amounts["amount"]),
                "journal_id": payment_method.journal_id.id,
                "force_outstanding_account_id": outstanding_account.id,
                "destination_account_id": destination_account.id,
                "ref": _("Combine %s POS payments from %s")
                % (payment_method.name, self.name),
                "pos_payment_method_id": payment_method.id,
                "pos_session_id": self.id,
            }
        )

        account_payment.action_post()
        return account_payment.move_id.line_ids.filtered(
            lambda line: line.account_id == account_payment.destination_account_id
        )
