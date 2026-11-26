# Copyright 2026 Daniel Reis
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import models
from odoo.tools import email_normalize


class PosOrder(models.Model):
    _inherit = "pos.order"

    def action_send_receipt(
        self, email, ticket_image, basic_image, update_partner_email=True
    ):
        res = super().action_send_receipt(email, ticket_image, basic_image)
        # Store the emailed receipt address on the customer, unless the
        # cashier opted out on the receipt screen
        new_email = email_normalize(email)
        if (
            update_partner_email
            and self.partner_id
            and new_email
            and email_normalize(self.partner_id.email) != new_email
        ):
            self.partner_id.email = new_email
        return res
