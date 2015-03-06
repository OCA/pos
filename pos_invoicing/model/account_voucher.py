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

from openerp.osv.orm import Model


class account_voucher(Model):
    _inherit = 'account.voucher'

    # Override section
    def recompute_voucher_lines(
            self, cr, uid, ids, partner_id, journal_id, price, currency_id,
            ttype, date, context=None):
        res = super(account_voucher, self).recompute_voucher_lines(
            cr, uid, ids, partner_id, journal_id, price, currency_id, ttype,
            date, context=context)
        aml_obj = self.pool.get('account.move.line')
        inv_obj = self.pool.get('account.invoice')
        for item in ['line_dr_ids', 'line_cr_ids']:
            for line in res['value'][item]:
                aml_id = line['move_line_id']
                if not aml_id:
                    continue
                aml = aml_obj.browse(cr, uid, aml_id, context=context)
                am_id = aml.move_id.id
                inv_ids = inv_obj.search(
                    cr, uid, [('move_id', '=', am_id)], context=context)
                inv_id = inv_ids and inv_ids[0] or False
                if not inv_id:
                    continue
                inv = inv_obj.browse(cr, uid, inv_id, context=context)
                if inv.forbid_payment:
                    res['value'][item].remove(line)
        return res
