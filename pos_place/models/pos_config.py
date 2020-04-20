# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    use_pos_place = fields.Boolean(
        string="Use Point of Sale places",
        default=False)

    group_pos_place_user_id = fields.Many2one(
        'res.groups', string='Point of Sale Place User Group',
        compute='_compute_group_pos_place_user_id',
        help="This field is there to pass the id of the pos place user"
        " group to the point of sale client.")

    @api.multi
    def _compute_group_pos_place_user_id(self):
        for config in self:
            config.group_pos_place_user_id =\
                self.env.ref('pos_place.group_pos_place_user')
