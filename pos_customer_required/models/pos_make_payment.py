# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from openerp import models, api, _
from openerp.exceptions import UserError


class PosMakePayment(models.TransientModel):
    _inherit = 'pos.make.payment'

    @api.multi
    def check(self):
        # Load current order
        order_obj = self.env['pos.order']
        order = order_obj.browse(self.env.context.get('active_id', False))

        # Check if control is required
        if not order.partner_id\
                and order.session_id.config_id.require_customer != 'no':
            raise UserError(_(
                "An anonymous order cannot be confirmed.\n"
                "Please select a customer for this order."))

        return super(PosMakePayment, self).check()
