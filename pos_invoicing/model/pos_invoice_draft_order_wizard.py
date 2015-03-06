# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Invoicing module for Odoo
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

from openerp.osv.orm import TransientModel


class pos_invoice_draft_order_wizard(TransientModel):
    _name = 'pos.invoice.draft.order.wizard'

    # Action section
    def invoice_draft_order(self, cr, uid, ids, context=None):
        order_id = context.get('active_id', False)
        if not order_id or context.get('active_model', False) != 'pos.order':
            return False
        po_obj = self.pool.get('pos.order')
        res = po_obj.action_invoice(cr, uid, [order_id], context=context)
        return res
