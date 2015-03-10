# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Keep Draft Orders module for Odoo
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

from openerp.osv import fields
from openerp.osv.orm import Model


class pos_order(Model):
    _inherit = 'pos.order'

    # Functional Field Section
    def _get_is_partial_paid(
            self, cr, uid, ids, name, arg, context=None):
        res = {}
        for po in self.browse(cr, uid, ids, context=context):
            res[po.id] = (po.state == 'draft') and len(po.statement_ids) != 0
        return res

    # Column Section
    _columns = {
        'is_partial_paid': fields.function(
            _get_is_partial_paid, string='Is Partially Paid'),
    }
