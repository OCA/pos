# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Order Pricelist Change for Odoo
#    Copyright (C) 2014 GRAP (http://www.grap.coop)
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
from openerp.tools.translate import _


class pos_order(Model):
    _inherit = 'pos.order'

    def action_recompute_pricelist(self, cr, uid, ids, context=None):
        pol_obj = self.pool.get('pos.order.line')
        for po in self.browse(cr, uid, ids, context=context):
            for pol in po.lines:
                res = pol_obj.onchange_product_id(
                    cr, uid, [pol.id], po.pricelist_id.id, pol.product_id.id,
                    pol.qty, po.partner_id.id)
                if res['value']['price_unit'] != pol.price_unit:
                    pol_obj.write(
                        cr, uid, [pol.id], res['value'], context=context)

    def onchange_pricelist_id(
            self, cr, uid, ids, pricelist_id, lines, context=None):
        if not pricelist_id or not lines:
            return {}
        warning = {
            'title': _('Pricelist Warning!'),
            'message': _(
                """If you change the pricelist of this order,"""
                """ prices of existing order lines will not be updated."""
                """ Please click on the 'Recompute With Pricelist'.""")
        }
        return {'warning': warning}
