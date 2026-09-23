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

from odoo import http
from odoo.http import request


class PosPaymentCreditController(http.Controller):
    @http.route(
        "/pos_payment_credit/payment",
        type="json",
        auth="user",
        methods=["POST"],
    )
    def pos_payment_credit_payment(self, partner_id, amount, order_id=None):
        """
        Process payment with credit amount
        Deducts the amount from partner's credit_amount
        """
        return request.env["pos.payment.method"].pos_payment_credit_payment(
            partner_id, amount, order_id
        )

    @http.route(
        "/pos_payment_credit/refund",
        type="json",
        auth="user",
        methods=["POST"],
    )
    def pos_payment_credit_refund(self, partner_id, amount, order_id=None):
        """
        Process refund to credit amount
        Adds the refunded amount to partner's credit_amount
        """
        return request.env["pos.payment.method"].pos_payment_credit_refund(
            partner_id, amount, order_id
        )

    @http.route(
        "/pos_payment_credit/get_balance",
        type="json",
        auth="user",
        methods=["POST"],
    )
    def pos_payment_credit_get_balance(self, partner_id):
        """
        Get current credit balance for a partner
        """
        return request.env["pos.payment.method"].pos_payment_credit_get_balance(
            partner_id
        )
