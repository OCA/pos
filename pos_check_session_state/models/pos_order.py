# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, models
from odoo.exceptions import UserError


class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def _process_order(self, pos_order):
        pos_session = self.env['pos.session'].browse(
            pos_order['pos_session_id'])
        if pos_session.state == 'closed':
            raise UserError(_("Unable to write an order in a closed Session"))
        return super()._process_order(pos_order)
