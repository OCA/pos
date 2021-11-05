# Copyright 2020 Coop IT Easy - Manuel Claeys Bouuaert
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, models
from odoo.exceptions import ValidationError


class PosSession(models.Model):
    _inherit = 'pos.session'

    @api.multi
    def action_pos_session_close(self):
        return super(
            PosSession, self.with_context(action_pos_session_close=True)
        ).action_pos_session_close()

    @api.multi
    def write(self, vals):
        if self.env.context.get("action_pos_session_close", False):
            closed_sessions = self.filtered(lambda x: x.state == "closed")
            if ("state" in vals and vals["state"] == "closed"
                    and closed_sessions):
                raise ValidationError(
                    _("You can not close a closed session.")
                )
        return super().write(vals)
