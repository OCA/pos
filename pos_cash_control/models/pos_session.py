# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, fields, models
from odoo.exceptions import UserError


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
                    "type": pm.is_cash_count,
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
                journal = payment_method.journal_id
                compare_to_zero = self.currency_id.compare_amounts(
                    bank_payment_method_diffs.get(payment_method.id), 0
                )
                if compare_to_zero == -1 and not journal.loss_acount_id:
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
            Pairs of payment_method_id and diff_amount which will be used to post
            loss/profit when closing the session.

        If successful, it returns {'successful': True}
        Otherwise, it returns {'successful': False, 'message': str, 'redirect': bool}.
        'redirect' is a boolean used to know whether we redirect the user to the back
        end or not.
        When necessary, error (i.e. UserError, AccessError) is raised which should
        redirect the user to the back end.
        """
        bank_payment_method_diffs = dict(bank_payment_method_diff_pairs or [])
        self.ensure_one()
        # Even if this is called in `post_closing_cash_details`, we need to call
        # this here too for case
        # where cash_control = False
        check_closing_session = self._cannot_close_session(bank_payment_method_diffs)
        if check_closing_session:
            return check_closing_session

        # For now we won't simply do
        # self._check_pos_session_balance()
        # self._check_bank_statement_state()
        # validate_result = self._validate_session()
        # becase some functions are being used and overriden in other modules...
        # so we'll try to use the original flow as of now for the moment
        validate_result = self.action_pos_session_closing_control()

        # If an error is raised, the user will still be redirected to the back
        # end to manually close the session.
        # If the return result is a dict, this means that normally we have a
        # redirection or a wizard => we redirect the user
        if isinstance(validate_result, dict):
            # imbalance accounting entry
            return {
                "successful": False,
                "message": validate_result.get("name"),
                "redirect": True,
            }

        self.message_post(body=_("Point of Sale Session ended"))

        return {"successful": True}

    def action_pos_session_closing_control(self):
        super(PosSession, self).action_pos_session_closing_control()
        return self.action_pos_session_validate()

    def _validate_session(self):
        try:
            super(PosSession, self)._validate_session()
            return True
        except UserError:
            self.env.cr.rollback()
            return self._close_session_action(
                sum(self.move_id.line_ids.mapped("balance"))
            )

    def _close_session_action(self, amount_to_balance):
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
