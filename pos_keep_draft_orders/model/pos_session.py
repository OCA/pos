# -*- encoding: utf-8 -*-
##############################################################################
#
#    POS Keep Draft Orders module for Odoo
#    Copyright (C) 2013-2014 GRAP (http://www.grap.coop)
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

from osv.osv import except_osv
from openerp.osv.orm import Model
from openerp.tools.translate import _


class pos_session(Model):
    _inherit = 'pos.session'

    # Overload Section
    def wkf_action_closing_control(self, cr, uid, ids, context=None):
        """Remove all PoS Orders in 'draft' to the sessions we want
        to close.
        Check if there is Partial Paid Orders"""
        po_obj = self.pool['pos.order']
        for ps in self.browse(cr, uid, ids, context=context):
            for po in ps.order_ids:
                # Check if there is a partial payment
                if po.is_partial_paid:
                    raise except_osv(
                        _('Error!'),
                        _("You cannot confirm this session, because '%s'"
                            " is in a 'draft' state with payments.\n\n"
                            "Please finish to pay this Order." % (
                                po.name)))
                # remove session id on the current PoS if it is in draft mode
                if po.state == 'draft' and ps.config_id.allow_slate:
                    po_obj.write(cr, uid, po.id, {
                        'session_id': None}, context=context)
        return super(pos_session, self).wkf_action_closing_control(
            cr, uid, ids, context=context)

    def create(self, cr, uid, values, context=None):
        """Recover all PoS Order in 'draft' mode and associate them to the new
        Pos Session"""
        po_obj = self.pool['pos.order']
        ps_id = super(pos_session, self).create(cr, uid, values, context)
        po_ids = po_obj.search(cr, uid, [
            ('state', '=', 'draft'), ('user_id', '=', uid)],
            context=context)
        po_obj.write(
            cr, uid, po_ids, {'session_id': ps_id}, context=context)
        return ps_id
