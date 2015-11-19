# -*- coding: utf-8 -*-
# (c) 2015 Daniel Campos <danielcampos@avanzosc.es> - Avanzosc S.L.
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from openerp import models, api, exceptions, _


class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.multi
    def action_confirm_picking(self):
        for order in self:
            if not order.partner_id:
                raise exceptions.Warning(
                    _('Customer must be selected to invoice from picking'))
            if not self.picking_id:
                order.create_picking()
                pick = order.picking_id
                pick.invoice_state = '2binvoiced'
                order.state = 'invoiced'
