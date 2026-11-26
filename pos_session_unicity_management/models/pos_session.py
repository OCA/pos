from odoo import api, models
from odoo.exceptions import ValidationError


class PosSession(models.Model):
    _inherit = "pos.session"

    @api.constrains("user_id", "state")
    def _check_unicity(self):
        """Prevent a user from having more than one active POS session.

        Users belonging to the group 'Allow Multiple POS Sessions' are exempt
        from this restriction.
        """
        for session in self:
            if session.rescue:
                continue
            if session.user_id.has_group(
                "pos_session_unicity_management.group_pos_multi_session"
            ):
                continue
            duplicate_count = self.search_count(
                [
                    ("state", "not in", ("closed", "closing_control")),
                    ("user_id", "=", session.user_id.id),
                    ("rescue", "=", False),
                    ("id", "!=", session.id),
                ]
            )
            if duplicate_count:
                raise ValidationError(
                    self.env._(
                        "You cannot create two active sessions "
                        "with the same responsible."
                    )
                )
