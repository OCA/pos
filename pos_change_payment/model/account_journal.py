# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Change Payment module for Odoo
#    Copyright (C) 2013-Today GRAP (http://www.grap.coop)
#    @author Julien WESTE
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)

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


class account_journal(Model):
    _inherit = 'account.journal'

    # Private Function Section
    def _get_pos_journal_selection(
            self, cr, uid, context=None):
        """Return Account Journal available for payment in PoS Module"""
        if not context or not context.get('pos_session_id', False):
            return False
        aj_obj = self.pool['account.journal']
        ps_obj = self.pool['pos.session']

        # Get Session of the Current PoS
        ps = ps_obj.browse(
            cr, uid, context.get('pos_session_id'), context=context)
        aj_ids = [j.id for j in ps.journal_ids]

        # Get Journals, order by type (cash before), and name
        aj_cash_ids = aj_obj.search(cr, uid, [
            ('id', 'in', aj_ids), ('type', '=', 'cash')], context=context)
        cash_res = aj_obj.read(
            cr, uid, aj_cash_ids, ['name', 'id'], context=context)
        cash_res = [(r['id'], r['name']) for r in cash_res]

        aj_other_ids = aj_obj.search(
            cr, uid, [
                ('id', 'in', aj_ids), ('type', '!=', 'cash')
            ], context=context)
        other_res = aj_obj.read(
            cr, uid, aj_other_ids, ['name', 'id'], context=context)
        other_res = [(r['id'], r['name']) for r in other_res]

        return cash_res + other_res
