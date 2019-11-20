# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    def _prepare_invoice(self):
        res = super()._prepare_invoice()
        res.update({
            'pos_pending_payment': True,
        })
        return res
