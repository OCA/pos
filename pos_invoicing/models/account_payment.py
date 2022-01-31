# Copyright (C) 2019 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, models
from odoo.exceptions import Warning as UserError


class AccountPaymentRegister(models.TransientModel):
    _inherit = "account.payment.register"

    def action_create_payments(self):
        context = self.env.context
        active_id = context.get("active_id")
        account_move = self.env["account.move"].browse(active_id)
        if account_move.pos_pending_payment:
            raise UserError(
                _(
                    "You can not realize this action on the payments(s) %s because"
                    " there are pending payments in the Point of Sale."
                )
                % (", ".join(account_move.mapped("name")))
            )
        return super().action_create_payments()
