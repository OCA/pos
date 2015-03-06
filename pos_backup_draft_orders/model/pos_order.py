# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Backup Draft Orders module for OpenERP
#    Copyright (C) 2013-2014 GRAP (http://www.grap.coop)
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

from openerp.osv.orm import Model


class pos_order(Model):
    _inherit = 'pos.order'

    # custom function
    def _create_draft_from_ui(self, cr, uid, orders, context=None):
        order_ids = []
        for tmp_order in orders:
            order = tmp_order['data']
            order_id = self.create(cr, uid, {
                'name': order['name'],
                'user_id': order['user_id'] or False,
                'session_id': order['pos_session_id'],
                'lines': order['lines'],
                'pos_reference': order['name'],
                'partner_id': order.get('partner_id', False)
            }, context)
            for payments in order['statement_ids']:
                payment = payments[2]
                self.add_payment(cr, uid, order_id, {
                    'amount': payment['amount'] or 0.0,
                    'payment_date': payment['name'],
                    'statement_id': payment['statement_id'],
                    'payment_name': payment.get('note', False),
                    'journal': payment['journal_id']
                }, context=context)
            order_ids.append(order_id)
        return order_ids

    # Overload section
    def create_from_ui(self, cr, uid, orders, context=None):
        """
        - remove from the 'orders' list all orders where amount_return is < 0
        (because that means they are not paid, but just saved) and put them
        in a 'saved_orders' list
        - call a specific function for the 'saved_orders' list
        - call the parent create_from_ui() for the remaining orders"""
        saved_orders = []
        for tmp_order in orders:
            if tmp_order['data']['amount_return'] < 0\
                    and abs(tmp_order['data']['amount_return']) > 0.000001:
                saved_orders.append(tmp_order)
                orders.remove(tmp_order)

        self._create_draft_from_ui(
            cr, uid, saved_orders, context=context)

        return super(pos_order, self).create_from_ui(
            cr, uid, orders, context=context)
