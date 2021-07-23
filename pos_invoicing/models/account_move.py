# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, fields, models
from odoo.exceptions import Warning as UserError


class AccountMove(models.Model):
    _inherit = "account.move"

    pos_pending_payment = fields.Boolean(
        string="PoS - Pending Payment",
        readonly=True,
        copy=False,
        help="Indicates an invoice for which there are pending payments in the"
        " Point of Sale. \nThe invoice will be marked as paid when the session"
        " will be closed.",
    )

    # Overload Section
    def button_cancel(self):
        self._check_pos_pending_payment()
        return super().button_cancel()

    def _check_pos_pending_payment(self):
        invoices = self.filtered(lambda x: x.pos_pending_payment)
        if invoices:
            raise UserError(
                _(
                    "You can not realize this action on the invoice(s) %s because"
                    " there are pending payments in the Point of Sale."
                )
                % (", ".join(invoices.mapped("name")))
            )
