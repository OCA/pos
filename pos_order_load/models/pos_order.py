# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2014 Akretion (<http://www.akretion.com>).
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
#    @author Sylvain Calador (sylvain.calador@akretion.com).
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

from openerp import models, api


class PosOrder(models.Model):
    _inherit = 'pos.order'

    # Overload Section
    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        if 'order_id' in ui_order:
            res['order_id'] = ui_order['order_id']
        return res

    @api.model
    def create_from_ui(self, orders):
        """
        Remove from the 'orders' list all orders where amount_return is < 0
        (because that means they are not paid, but just in draft state).
        * call a specific function for the draft orders list
        * call the parent create_from_ui() for the remaining orders"""
        draft_orders = []
        for tmp_order in orders:
            if tmp_order['data']['amount_return'] < 0\
                    and abs(tmp_order['data']['amount_return']) > 0.000001:
                draft_orders.append(tmp_order)
                orders.remove(tmp_order)

        # Save Draft Orders
        self._create_draft_order_from_ui(draft_orders)

        # Save Paid Orders
        return super(PosOrder, self).create_from_ui(orders)

    # Custom Section
    @api.model
    def search_read_orders(self, query):
        condition = [
            ('state', '=', 'draft'),
            ('statement_ids', '=', False),
            '|',
            ('name', 'ilike', query),
            ('partner_id', 'ilike', query)
        ]
        fields = ['name', 'partner_id', 'amount_total']
        return self.search_read(condition, fields, limit=10)

    @api.model
    def load_order(self, order_id):
        order = self.browse(order_id)
        condition = [('order_id', '=', order_id)]
        fields = ['product_id', 'price_unit', 'qty', 'discount']
        orderlines = self.lines.search_read(condition, fields)
        return {
            'id': order.id,
            'name': order.pos_reference,
            'partner_id': order.partner_id.id,
            'orderlines': orderlines,
        }

    @api.model
    def _create_draft_order_from_ui(self, orders):
        for order_tmp in orders:
            order_data = order_tmp['data']
            statements_data = order_data['statement_ids']
            order_data.pop('statement_ids')

            # create Order
            order = self.create(self._order_fields(order_data))

            # Create payment
            for statement_data in statements_data:
                self.add_payment(
                    order.id, self._payment_fields(statement_data[2]))
