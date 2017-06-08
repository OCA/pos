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
from openerp.osv.osv import except_osv
from openerp.tools.translate import _


class pos_order(Model):
    _inherit = 'pos.order'

    def _merge_cash_payment(self, cr, uid, ids, context=None):
        absl_obj = self.pool['account.bank.statement.line']
        for po in self.browse(cr, uid, ids, context=context):
            absl_cash_ids = [
                x.id for x in po.statement_ids
                if x.statement_id.journal_id.type == 'cash']
            new_payments = {}
            for line in absl_obj.read(
                    cr, uid, absl_cash_ids,
                    ['statement_id', 'amount'],
                    context=context):
                if line['statement_id'][0] in new_payments.keys():
                    new_payments[line['statement_id'][0]] += line['amount']
                else:
                    new_payments[line['statement_id'][0]] = line['amount']

            # Delete all obsolete account bank statement line
            absl_obj.unlink(cr, uid, absl_cash_ids, context=context)

            # Create a new ones
            for k, v in new_payments.items():
                self.add_payment(cr, uid, po.id, {
                    'statement_id': k,
                    'amount': v
                    }, context=context)

    # Overload Section
    def action_paid(self, cr, uid, ids, context=None):
        """ Merge all cash statement line of the Order"""
        context = context or {}
        ctx = context.copy()
        ctx['change_pos_payment'] = True
        self._merge_cash_payment(cr, uid, ids, context=ctx)
        return super(pos_order, self).action_paid(
            cr, uid, ids, context=context)

    # Private Function Section
    def _allow_change_payments(
            self, cr, uid, ids, context=None):
        """Return True if the user can change the payment of a POS, depending
        of the state of the current session."""
        for po in self.browse(cr, uid, ids, context=context):
            if po.session_id.state == 'closed':
                raise except_osv(
                    _('Error!'),
                    _("""You can not change payments of the POS '%s' because"""
                        """ the associated session '%s' has been closed!""" % (
                            po.name, po.session_id.name)))
        return True
