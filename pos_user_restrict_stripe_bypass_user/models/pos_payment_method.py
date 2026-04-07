# Copyright 2025 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    @api.model
    def stripe_connection_token(self):
        if self.env.user.has_group(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        ):
            self = self.with_context(bypass_pos_user=True)
        return super().stripe_connection_token()

    def stripe_payment_intent(self, amount):
        if self.env.user.has_group(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        ):
            self = self.with_context(bypass_pos_user=True)
        return super().stripe_payment_intent(amount)

    @api.model
    def stripe_capture_payment(self, paymentIntentId, amount=None):
        if self.env.user.has_group(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        ):
            self = self.with_context(bypass_pos_user=True)
        return super().stripe_capture_payment(paymentIntentId, amount)
