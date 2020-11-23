# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class PosSession(models.Model):
    _inherit = "pos.session"

    @api.model
    def create(self, values):
        pos_config_id = values.get('config_id')\
            or self.env.context.get('default_config_id')
        return super(PosSession, self.with_context(
            pos_config_id=pos_config_id)).create(values)
