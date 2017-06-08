# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Change Payment module for Odoo
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
from openerp.osv import fields
from openerp import netsvc


class pos_make_payment(TransientModel):
    _inherit = 'pos.make.payment'

    def check(self, cr, uid, ids, context=None):
        """Check the order:
        if the order is not paid: continue payment,
        if the order is paid print ticket.
        """
        context = context or {}
        order_obj = self.pool.get('pos.order')
        active_id = context and context.get('active_id', False)

        order = order_obj.browse(cr, uid, active_id, context=context)
        amount = order.amount_total - order.amount_paid
        data = self.read(cr, uid, ids, context=context)[0]
        data['journal'] = data['journal_id']

        if amount != 0.0:
            order_obj.add_payment(cr, uid, active_id, data, context=context)

        if order_obj.test_paid(cr, uid, [active_id]):
            wf_service = netsvc.LocalService('workflow')
            wf_service.trg_validate(uid, 'pos.order', active_id, 'paid', cr)
            return {'type': 'ir.actions.act_window_close'}

        return self.launch_payment(cr, uid, ids, context=context)

    # Selection Section
    def _select_journals(self, cr, uid, context=None):
        aj_obj = self.pool['account.journal']
        return aj_obj._get_pos_journal_selection(cr, uid, context=context)

    # Column Section
    _columns = {
        # Redefine journal_id from many2one to selection
        'journal_id': fields.selection(
            _select_journals, 'Journal', required=True, size=-1),
    }

    # Default Section
    def _default_journal(self, cr, uid, context=None):
        aj_obj = self.pool['account.journal']
        res = aj_obj._get_pos_journal_selection(cr, uid, context=context)
        if res and len(res) > 1:
            return res[0][0]
        else:
            return False

    _defaults = {
        'journal_id': _default_journal,
    }
