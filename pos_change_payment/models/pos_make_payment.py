# coding: utf-8
# Copyright (C) 2015-Today GRAP (http://www.grap.coop)
# @author Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, models, fields


class PosMakePayment(models.TransientModel):
    _inherit = 'pos.make.payment'

    # # Column Section (Overload)
    journal_id = fields.Many2one(
        default=False,
        domain=lambda s: s._domain_journal_id())

    @api.model
    def _domain_journal_id(self):
        session_obj = self.env['pos.session']
        if self.env.context.get('pos_session_id', False):
            session = session_obj.browse(
                int(self._context.get('pos_session_id')))
            return [('id', 'in', session.journal_ids.ids)]
        return []
