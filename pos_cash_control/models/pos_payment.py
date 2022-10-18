# Copyright 2022 Odoo
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, fields, models
from odoo.tools import float_is_zero


class PosPayment(models.Model):

    _inherit = "pos.payment"

    account_move_id = fields.Many2one("account.move")

    def _create_payment_moves(self):
        result = self.env["account.move"]
        for payment in self:
            order = payment.pos_order_id
            payment_method = payment.payment_method_id
            if payment_method.type == "pay_later" or float_is_zero(
                payment.amount, precision_rounding=order.currency_id.rounding
            ):
                continue
            accounting_partner = self.env["res.partner"]._find_accounting_partner(
                payment.partner_id
            )
            pos_session = order.session_id
            journal = pos_session.config_id.journal_id
            payment_move = (
                self.env["account.move"]
                .with_context(default_journal_id=journal.id)
                .create(
                    {
                        "journal_id": journal.id,
                        "date": fields.Date.context_today(payment),
                        "ref": _("Invoice payment for %s (%s) using %s")
                        % (order.name, order.account_move.name, payment_method.name),
                        "pos_payment_ids": payment.ids,
                    }
                )
            )
            result |= payment_move
            payment.write({"account_move_id": payment_move.id})
            amounts = pos_session._update_amounts(
                {"amount": 0, "amount_converted": 0},
                {"amount": payment.amount},
                payment.payment_date,
            )
            credit_line_vals = pos_session._credit_amounts(
                {
                    "account_id": accounting_partner.property_account_receivable_id.id,
                    "partner_id": accounting_partner.id,
                    "move_id": payment_move.id,
                },
                amounts["amount"],
                amounts["amount_converted"],
            )
            debit_line_vals = pos_session._debit_amounts(
                {
                    "account_id": pos_session.company_id.account_default_pos_receivable_account_id.id,  # noqa
                    "move_id": payment_move.id,
                },
                amounts["amount"],
                amounts["amount_converted"],
            )
            self.env["account.move.line"].with_context(
                check_move_validity=False
            ).create([credit_line_vals, debit_line_vals])
            payment_move._post()
        return result
