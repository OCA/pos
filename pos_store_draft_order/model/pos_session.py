# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Store Draft Orders Module for Odoo
#    Copyright (C) 2013-Today GRAP (http://www.grap.coop)
#    @author Julien WESTE
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
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

from openerp import api, models
from openerp.exceptions import Warning
from openerp.tools.translate import _


class PosSession(models.Model):
    _inherit = 'pos.session'

    # Overload Section
    @api.model
    def create(self, vals):
        """Recover all PoS Order in 'draft' state and associate them to the new
        Pos Session"""
        order_obj = self.env['pos.order']

        res = super(PosSession, self).create(vals)
        draftOrders = order_obj.search([
            ('state', '=', 'draft'), ('user_id', '=', self._uid)])
        draftOrders.write({'session_id': res.id})

        return res

    @api.multi
    def wkf_action_closing_control(self):
        """Remove all PoS Orders in 'draft' to the sessions we want
        to close.
        Check if there is any Partial Paid Orders"""
        self._remove_session_from_draft_orders()
        return super(PosSession, self).wkf_action_closing_control()

    # Custom Section
    @api.one
    def _remove_session_from_draft_orders(self):
        for order in self.order_ids:
            # Check if there is a partial payment
            if order.is_partial_paid:
                raise Warning(_(
                    "You cannot confirm this session, because '%s' is"
                    " still in 'draft' state with associated payments.\n\n"
                    " Please finish to pay this Order first." % (order.name)))
            # remove session id on the current Order if it is in draft state
            if order.state == 'draft' and\
                    self.config_id.allow_store_draft_order:
                order.write({'session_id': False})
