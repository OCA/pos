# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import api, fields, models


class PosSession(models.Model):
    _inherit = "res.partner"

    membership_state_text = fields.Char(
        compute="_compute_membership_state_text",
        help="Technical field used to display the label"
        " of the field 'membership_state' in the"
        " Front End Point of sale UI",
    )

    @api.depends("membership_state")
    def _compute_membership_state_text(self):
        for partner in self:
            partner.membership_state_text = dict(
                self._fields["membership_state"]._description_selection(self.env)
            )[partner.membership_state]
