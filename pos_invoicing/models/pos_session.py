# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def action_pos_session_close(self):
        res = super().action_pos_session_close()
        self.order_ids.account_move.pos_pending_payment = False
        return res
