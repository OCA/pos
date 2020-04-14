# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class AccountJournal(models.Model):
    _inherit = "account.journal"

    pos_control = fields.Boolean(
        string="POS Journal Control",
        help="If you want this journal"
        " to be controled at closing of point of sale, check this option",
        default=False
    )

    @api.onchange("type")
    def onchange_type(self):
        for journal in self:
            if journal.type in ["bank", "cash"]:
                journal.pos_control = True
            else:
                journal.pos_control = False
