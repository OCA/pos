# Copyright 2021 Akretion France (http://www.akretion.com/)
# @author: Alexis de Lattre <alexis.delattre@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _accumulate_amounts(self, data):
        data = super()._accumulate_amounts(data)
        # IDEA : move split_receivables and combine_receivables to
        # split_receivables_cash and combine_receivables_cash
        # if bank_statement is true on pos.payment.method
        # The big advantage of this implementation is that
        # there is no need to re-implement the logic of
        # _create_cash_statement_lines_and_cash_move_lines()
        # and update _reconcile_account_move_lines()
        # The drawback is that we store the bank journal for the non
        # cash method payment in the native field cash_journal_id
        # which is a bit "strange"
        # I have to do that because the method
        # _create_cash_statement_lines_and_cash_move_lines()
        # reads payment_method_id.cash_journal_id
        payment_methods_bank_statement = self.env["pos.payment.method"].search(
            [
                ("is_cash_count", "=", False),
                ("bank_statement", "=", True),
                ("cash_journal_id", "!=", False),
            ]
        )
        if payment_methods_bank_statement:
            self.write(
                {
                    "statement_ids": [
                        (
                            0,
                            0,
                            {
                                "journal_id": pay_method.cash_journal_id.id,
                                "name": self.name,
                            },
                        )
                        for pay_method in payment_methods_bank_statement
                    ]
                }
            )
            # I can't pop data['split_receivables'] inside a loop on
            # data['split_receivables'],
            # that's why I use dict(data['split_receivables'])
            for pos_payment, value in dict(data["split_receivables"]).items():
                if pos_payment.payment_method_id in payment_methods_bank_statement:
                    data["split_receivables_cash"][pos_payment] = value
                    data["split_receivables"].pop(pos_payment)
            for pos_payment_method, value in dict(data["combine_receivables"]).items():
                if pos_payment_method in payment_methods_bank_statement:
                    data["combine_receivables_cash"][pos_payment_method] = value
                    data["combine_receivables"].pop(pos_payment_method)
        return data
