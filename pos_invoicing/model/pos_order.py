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

from openerp.osv import osv
from openerp.osv.orm import Model
from openerp.tools.translate import _
from openerp import netsvc


class pos_order(Model):
    _inherit = 'pos.order'

    def action_invoice(self, cr, uid, ids, context=None):
        inv_obj = self.pool['account.invoice']
        wf_service = netsvc.LocalService('workflow')
        for po in self.browse(cr, uid, ids, context=context):
            if po.state not in ('draft', 'paid'):
                raise osv.except_osv(
                    _('Error!'),
                    _("You can not invoice a non new or non paid POS Order"))
            if po.state == 'draft' and len(po.statement_ids) != 0:
                raise osv.except_osv(
                    _('Error!'),
                    _("You can not invoice a partial paid POS Order"))
            if po.amount_total == 0:
                raise osv.except_osv(
                    _('Error!'),
                    _("You can not invoice an empty POS Order"))
        res = super(pos_order, self).action_invoice(
            cr, uid, ids, context=context)
        for po in self.browse(cr, uid, ids, context=context):
            forbid_payment = po.state == 'invoiced' and\
                len(po.statement_ids) != 0
            inv_obj.write(cr, uid, [po.invoice_id.id], {
                'forbid_payment': forbid_payment,
                'date_invoice': po.date_order,
            }, context=context)
            wf_service.trg_validate(
                uid, 'account.invoice', po.invoice_id.id,
                'invoice_open', cr)

        return res
