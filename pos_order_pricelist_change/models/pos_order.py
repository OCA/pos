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

from openerp.models import Model
from openerp import api, _


class PosOrder(Model):
    _inherit = 'pos.order'

    @api.multi
    def action_recompute_pricelist(self):
        for po in self:
            for pol in po.lines:
                res = pol.onchange_product_id(
                    po.pricelist_id.id, pol.product_id.id, qty=pol.qty,
                    partner_id=po.partner_id.id)
                pol.write(res['value'])

    @api.onchange('pricelist_id')
    def onchange_pricelist_id(self):
        if not self.pricelist_id or not self.lines:
            return {}
        warning = {
            'title': _('Pricelist Warning!'),
            'message': _(
                """If you change the pricelist of this order,"""
                """ prices of existing order lines will not be updated."""
                """ Please click on the 'Recompute With Pricelist'.""")
        }
        return {'warning': warning}
