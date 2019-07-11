# Copyright (C) 2019 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, models
from odoo.exceptions import Warning as UserError


class AccountPayment(models.Model):
    _inherit = 'account.payment'

    @api.multi
    def post(self):
        payments = self.filtered(
            lambda x: any(x.mapped('invoice_ids.pos_pending_payment')))
        if payments:
            raise UserError(_(
                "You can not realize this action on the payments(s) %s because"
                " there are pending payments in the Point of Sale.") % (
                    ', '.join(
                        [x for x in payments.mapped('communication') if x])))
        return super().post()
