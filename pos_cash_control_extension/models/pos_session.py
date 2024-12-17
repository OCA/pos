# Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def set_cashbox_pos(self, cashbox_value: int, notes: str):
        self.state = "opened"
        self.opening_notes = notes
        self.cash_register_balance_start = cashbox_value
        self._post_cash_details_message("Opening", 0.0, notes)

    def get_closing_control_data(self):
        res = super().get_closing_control_data()
        orders = self._get_closed_orders()
        cash_payment_method_ids = self.payment_method_ids.filtered(
            lambda pm: pm.type == "cash"
        )
        default_cash_payment_method_id = (
            cash_payment_method_ids[0] if cash_payment_method_ids else None
        )
        payments = orders.payment_ids.filtered(
            lambda p: p.payment_method_id.type != "pay_later"
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
        if "default_cash_details" in res and res["default_cash_details"]:
            res["default_cash_details"]["opening"] = self.cash_register_balance_start
            res["default_cash_details"]["amount"] = (
                self.cash_register_balance_start
                + total_default_cash_payment_amount
                + sum(self.sudo().statement_line_ids.mapped("amount"))
            )
        return res

    def _post_statement_difference(self, amount, is_opening):
        pass

    def post_closing_cash_details(self, counted_cash):
        res = super().post_closing_cash_details(counted_cash)
        self.cash_register_balance_end_real = self.cash_register_balance_start or 0.0
        return res
