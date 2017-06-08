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
from openerp.osv.orm import TransientModel


class pos_change_payments_wizard_line(TransientModel):
    _name = 'pos.change.payments.wizard.line'

    # Selection Section
    def _select_journals(self, cr, uid, context=None):
        aj_obj = self.pool['account.journal']
        return aj_obj._get_pos_journal_selection(cr, uid, context=context)

    # Column Section
    _columns = {
        'wizard_id': fields.many2one(
            'pos.change.payments.wizard', 'Wizard Ref', ondelete='cascade'),
        'journal_id': fields.selection(
            _select_journals, 'Journal', required=True),
        'amount': fields.float(
            'Amount'),
    }
