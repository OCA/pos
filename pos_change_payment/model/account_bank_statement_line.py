# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Multiple Cash Control module for Odoo
#    Copyright (C) 2015-Today GRAP (http://www.grap.coop)
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
from openerp.osv.osv import except_osv
from openerp.tools.translate import _


class account_bank_statement_line(Model):
    _inherit = 'account.bank.statement.line'

    _POS_PAYMENT_ALLOW_WRITE = [
        'sequence', 'move_ids',
    ]

    # Private Function Section
    def _check_allow_change_pos_payment(
            self, cr, uid, ids, vals, context=None):
        """Allow or block change of account bank statement line, linked to
        a non draft POS Order.
            * if 'change_pos_payment' is in the context, changes are allowed;
            * otherwise:
                * allow write of some fields only;
            * forbid deletion;"""
        context = context or {}
        values = vals.copy() if vals else {}
        check_pos_order = False
        po_obj = self.pool['pos.order']

        if not ids:
            return True

        if values:
            # Allow some write
            for key in self._POS_PAYMENT_ALLOW_WRITE:
                if key in values:
                    del values[key]
            if not values:
                return True

        # Allow changes, if user use the wizard
        if context.get('change_pos_payment', False):
            check_pos_order = True

        for absl in self.browse(cr, uid, ids, context=context):
            if absl.pos_statement_id:
                if absl.pos_statement_id.state != 'draft':
                    if check_pos_order:
                        po_obj._allow_change_payments(
                            cr, uid, [absl.pos_statement_id.id],
                            context=context)
                    else:
                        if values.keys() == ['partner_id']:
                            po_obj._allow_change_payments(
                                cr, uid, [absl.pos_statement_id.id],
                                context=context)
                        else:
                            raise except_osv(
                                _('Error!'),
                                _("""You can not change payments of POS by"""
                                    """ this way. Please use the regular"""
                                    """ wizard in POS view!"""))
        return True

    # Overload Section
    def write(self, cr, uid, ids, vals, context=None):
        self._check_allow_change_pos_payment(
            cr, uid, ids, vals, context=context)
        res = super(account_bank_statement_line, self).write(
            cr, uid, ids, vals, context=context)
        return res

    def unlink(self, cr, uid, ids, context=None):
        self._check_allow_change_pos_payment(
            cr, uid, ids, None, context=context)
        res = super(account_bank_statement_line, self).unlink(
            cr, uid, ids, context=context)
        return res
