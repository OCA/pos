# coding: utf-8
# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.multi
    def action_invoice(self):
        res = super(PosOrder, self).action_invoice()
        self.mapped('invoice_id').write({'pos_pending_payment': True})
        self.mapped('invoice_id').signal_workflow('invoice_open')
        return res
