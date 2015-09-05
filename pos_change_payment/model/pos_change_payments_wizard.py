# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Change Payment module for Odoo
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

from openerp.osv import fields
from openerp.osv.osv import except_osv
from openerp.osv.orm import TransientModel
from openerp.tools.translate import _


class pos_change_payments_wizard(TransientModel):
    _name = 'pos.change.payments.wizard'

    # View Section
    def default_get(self, cr, uid, fields, context=None):
        po_obj = self.pool['pos.order']
        if context.get('active_model', False) != 'pos.order':
            raise except_osv(_('Error!'), _('Incorrect Call!'))
        res = super(pos_change_payments_wizard, self).default_get(
            cr, uid, fields, context=context)
        po = po_obj.browse(
            cr, uid, context.get('active_id'), context=context)
        res.update({'order_id': po.id})
        res.update({'amount_total': po.amount_total})
        return res

    # Column Section
    _columns = {
        'order_id': fields.many2one(
            'pos.order', 'POS Order', required=True, readonly=True),
        'line_ids': fields.one2many(
            'pos.change.payments.wizard.line', 'wizard_id', 'Wizard Lines'),
        'amount_total': fields.float(
            'Total', readonly=True),
    }

    # Action section
    def button_change_payments(self, cr, uid, ids, context=None):
        po_obj = self.pool['pos.order']
        absl_obj = self.pool['account.bank.statement.line']

        ctx = context.copy()
        ctx['change_pos_payment'] = True

        for pcpw in self.browse(cr, uid, ids, context=context):
            po = po_obj.browse(cr, uid, pcpw.order_id.id, context=context)

            # Check if the total is correct
            total = 0
            for line in pcpw.line_ids:
                total += line.amount
            if total != pcpw.amount_total:
                raise except_osv(
                    _('Error!'),
                    _("""Differences between the two values for the POS"""
                        """ Order '%s':\n\n"""
                        """ * Total of all the new payments %s;\n"""
                        """ * Total of the POS Order %s;\n\n"""
                        """Please change the payments.""" % (
                            po.name, total, po.amount_total)))

            # Check if change payments is allowed
            po_obj._allow_change_payments(
                cr, uid, [po.id], context=context)

            # Remove old statements
            absl_obj.unlink(
                cr, uid, [x.id for x in po.statement_ids], context=ctx)

            # Create new payment
            for line in pcpw.line_ids:
                po_obj.add_payment(cr, uid, po.id, {
                    'journal': int(line.journal_id),
                    'amount': line.amount,
                }, context=context)

        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }
