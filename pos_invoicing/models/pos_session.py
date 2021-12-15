# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging

from odoo import models

_logger = logging.getLogger(__name__)


class PosSession(models.Model):
    _inherit = "pos.session"

    def action_pos_session_close(self):
        res = super().action_pos_session_close()
        orders = self.mapped("order_ids").filtered(lambda x: x.account_move)
        orders.mapped("account_move").write({"pos_pending_payment": False})
        return res
