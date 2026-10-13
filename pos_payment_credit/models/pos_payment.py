##############################################################################
#
#    Copyright since 2009 Trobz (<https://trobz.com/>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from odoo import api, fields, models


class PosPayment(models.Model):
    _inherit = "pos.payment"

    is_credit_payment = fields.Boolean(
        compute="_compute_is_credit_payment",
        store=True,
    )

    @api.depends("payment_method_id.use_payment_terminal")
    def _compute_is_credit_payment(self):
        for payment in self:
            payment.is_credit_payment = (
                payment.payment_method_id.use_payment_terminal == "credit"
            )

    @api.model_create_multi
    def create(self, vals_list):
        """
        Override to automatically process credit payments on creation
        This handles backend payment creation (wizard, tests, etc.)
        Frontend POS payments are processed via controller before creation
        """
        payments = super().create(vals_list)

        # Process credit payments that haven't been processed yet
        # (if transaction_id is set, it means controller already processed it)
        credit_payments = payments.filtered(
            lambda p: p.is_credit_payment
            and p.partner_id
            and p.amount != 0
            and not p.transaction_id
        )

        for payment in credit_payments:
            # Negative amount = refund (add credit)
            # Positive amount = payment (deduct credit)
            if payment.amount < 0:
                # Refund - add credit
                refund_amount = abs(payment.amount)
                payment.partner_id.sudo().write(
                    {"credit_amount": payment.partner_id.credit_amount + refund_amount}
                )
                payment.transaction_id = (
                    f"REFUND-{payment.partner_id.id}-{payment.pos_order_id.id}"
                )
            else:
                # Payment - deduct credit
                payment.partner_id.sudo().write(
                    {"credit_amount": payment.partner_id.credit_amount - payment.amount}
                )
                payment.transaction_id = (
                    f"CREDIT-{payment.partner_id.id}-{payment.pos_order_id.id}"
                )

        return payments

    def _create_payment_moves(self, is_reverse=False):
        """
        Override to handle credit payment moves
        Credit amounts are automatically processed in create() for backend
        or via controller for frontend POS
        """
        res = super()._create_payment_moves(is_reverse=is_reverse)

        # Ensure transaction_id is set for credit payments
        credit_payments = self.filtered(lambda p: p.is_credit_payment)
        for payment in credit_payments:
            if (
                payment.partner_id
                and payment.amount != 0
                and not payment.transaction_id
            ):
                payment.transaction_id = (
                    f"CREDIT-{payment.partner_id.id}-{payment.pos_order_id.id}"
                )

        return res
