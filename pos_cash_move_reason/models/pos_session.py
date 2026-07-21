# Copyright (C) 2019-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, fields, models
from odoo.exceptions import AccessError, UserError


class PosSession(models.Model):
    _inherit = "pos.session"

    display_move_reason_income = fields.Boolean(compute="_compute_display_move_reason")

    display_move_reason_expense = fields.Boolean(compute="_compute_display_move_reason")

    def _compute_display_move_reason(self):
        MoveReason = self.env["pos.move.reason"]
        all_reasons = MoveReason.search(
            [("company_id", "in", self.mapped("config_id.company_id").ids)]
        )
        for session in self:
            # Get all reasons
            reasons = all_reasons.filtered_domain(
                [("company_id", "=", session.config_id.company_id.id)]
            )
            session.display_move_reason_income = len(
                reasons.filtered(lambda x: x.is_income_reason)
            )
            session.display_move_reason_expense = len(
                reasons.filtered(lambda x: x.is_expense_reason)
            )

    def button_move_income(self):
        return self._button_move_reason("income")

    def button_move_expense(self):
        return self._button_move_reason("expense")

    def _button_move_reason(self, move_type):
        action = (
            self.env.ref("pos_cash_move_reason.action_wizard_pos_move_reason")
            .sudo()
            .read()[0]
        )
        action["context"] = {
            "default_move_type": move_type,
        }
        return action

    # Add _get_pos_ui_ and _loader_params_ for each model
    # For pos_move_reason
    def _get_pos_ui_pos_move_reason(self, params):
        return self.env["pos.move.reason"].search_read(**params["search_params"])

    def _loader_params_pos_move_reason(self):
        return {
            "search_params": {
                "fields": [
                    "name",
                    "journal_ids",
                    "is_income_reason",
                    "is_expense_reason",
                ],
            },
        }

    # For account journal
    def _get_pos_ui_account_journal(self, params):
        return self.env["account.journal"].search_read(**params["search_params"])

    def _loader_params_account_journal(self):
        return {
            "search_params": {
                "fields": ["name"],
            },
        }

    # Overrid for payment method to add journal_id,
    # to filter payment methods with only journal selected on pos session
    def _loader_params_pos_payment_method(self):
        result = super()._loader_params_pos_payment_method()
        result["search_params"]["fields"].append("journal_id")
        return result

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        result.append("pos.move.reason")
        result.append("account.journal")
        return result

    # Rewrite it to handle several journals for pos_cash_move_reason
    # Inspired by core code from Odoo SA
    # add "move_reason" and "journal_id" in dict extras
    def try_cash_in_out(self, _type, amount, reason, extras):
        sign = 1 if _type == "in" else -1
        sessions = self.filtered("cash_journal_id")
        if not sessions:
            raise UserError(_("There is no cash payment method for this PoS Session"))

        # Handle move_reason
        move_reason = self.env["pos.move.reason"].browse(extras["move_reason"])
        journal = self.env["account.journal"].browse(extras["journal_id"])

        # Handle account
        if _type == "in":
            account_id = move_reason.income_account_id.id
        else:
            account_id = move_reason.expense_account_id.id

        self.env["account.bank.statement.line"].sudo().create(
            [
                {
                    "pos_session_id": session.id,
                    "journal_id": journal.id or session.cash_journal_id.id,
                    "amount": sign * amount,
                    "date": fields.Date.context_today(self),
                    "payment_ref": "-".join(
                        [move_reason.name, extras["translatedType"], reason]
                    ),
                    # Add this part
                    "counterpart_account_id": account_id,
                    "pos_move_reason_id": move_reason.id,
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

    # Rewrite it to handle several journals for pos_cash_move_reason
    # Inspired by core code from Odoo SA
    # This code change other_payment_methods and adjust default_cash_details
    def get_closing_control_data(self):

        if not self.env.user.has_group("point_of_sale.group_pos_user"):
            raise AccessError(
                _(
                    "You don't have the access rights to get the "
                    "point of sale closing control data."
                )
            )
        self.ensure_one()

        # -------------------------
        # FROM CORE CODE
        # -------------------------
        orders = self.order_ids.filtered(
            lambda o: o.state == "paid" or o.state == "invoiced"
        )
        payments = orders.payment_ids.filtered(
            lambda p: p.payment_method_id.type != "pay_later"
        )
        pay_later_payments = orders.payment_ids - payments
        cash_payment_method_ids = self.payment_method_ids.filtered(
            lambda pm: pm.type == "cash"
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
        cash_in_out_list = []
        last_session = self.search(
            [("config_id", "=", self.config_id.id), ("id", "!=", self.id)], limit=1
        )

        # New
        other_payment_methods_data = []
        all_account_bank_statement_lines = self.sudo().statement_line_ids

        # -------------------------------------
        # LOOP PAYMENTS OF EACH PAYMENT METHODS
        # -------------------------------------
        for pm in self.payment_method_ids:

            pm_payments = payments.filtered(lambda p: p.payment_method_id == pm)
            payment_amount = sum(pm_payments.mapped("amount"))
            payment_count = len(pm_payments)

            # --------------------------
            # TOTAL : PAYMENT + IN / OUT
            # --------------------------
            total_amount = payment_amount

            # Init
            move_list = []
            move_in_count = 0
            move_out_count = 0

            statement_lines = all_account_bank_statement_lines.filtered(
                lambda l: l.journal_id == pm.journal_id
            )

            for move in statement_lines.sorted("create_date"):
                if move.amount > 0:
                    move_in_count += 1
                    name = f"Cash in {move_in_count}"
                else:
                    move_out_count += 1
                    name = f"Cash out {move_out_count}"

                # TOTAL : PAYMENT + IN / OUT
                total_amount += move.amount
                move_list.append(
                    {
                        "name": move.payment_ref if move.payment_ref else name,
                        "amount": move.amount,
                    }
                )

            # -------------------------------------------
            # CASH SPECIFIC DATA to fit Odoo res needed
            # -------------------------------------------
            if pm.id == default_cash_payment_method_id.id:
                cash_in_out_list = move_list
                continue
            else:

                # -------------------------
                # BUILD RESULT
                # -------------------------
                other_payment_methods_data.append(
                    {
                        "name": pm.name,
                        "amount": total_amount,
                        "number": payment_count,
                        "id": pm.id,
                        "type": pm.type,
                        "payments": {
                            "amount": payment_amount,
                            "count": payment_count,
                        },
                        "moves": move_list,
                    }
                )

        # -------------------------
        # FINAL RETURN
        # -------------------------
        return {
            "orders_details": {
                "quantity": len(orders),
                "amount": sum(orders.mapped("amount_total")),
            },
            "payments_amount": sum(payments.mapped("amount")),
            "pay_later_amount": sum(pay_later_payments.mapped("amount")),
            "opening_notes": self.opening_notes,
            # default_cash_details → add filtered for amount
            "default_cash_details": {
                "name": default_cash_payment_method_id.name,
                "amount": last_session.cash_register_balance_end_real
                + total_default_cash_payment_amount
                + sum(
                    self.sudo()
                    .statement_line_ids.filtered(
                        lambda l: l.journal_id
                        == default_cash_payment_method_id.journal_id
                    )
                    .mapped("amount")
                ),
                "opening": last_session.cash_register_balance_end_real,
                "payment_amount": total_default_cash_payment_amount,
                "moves": cash_in_out_list,
                "id": default_cash_payment_method_id.id,
            }
            if default_cash_payment_method_id
            else None,
            "other_payment_methods": other_payment_methods_data,
            "is_manager": self.user_has_groups("point_of_sale.group_pos_manager"),
            "amount_authorized_diff": self.config_id.amount_authorized_diff
            if self.config_id.set_maximum_difference
            else None,
        }
