# Copyright 2023 Akretion (http://www.akretion.com).
# @author Florian Mounier <florian.mounier@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, models
from odoo.exceptions import UserError


class RescueSessionUnavailableError(UserError):
    pass


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _get_valid_session(self, order):
        closed_session = self.env["pos.session"].browse(order["pos_session_id"])

        # Do nothing if the option is not enabled
        if not closed_session.config_id.disable_rescue_session:
            return super()._get_valid_session(order)

        # Look for an open session with the same config
        open_session = self.env["pos.session"].search(
            [
                ("state", "=", "opened"),
                ("config_id", "=", closed_session.config_id.id),
            ],
            limit=1,
        )
        # If there is an open session, we use it
        if open_session:
            return open_session

        # If there is no open session, we raise an error
        # That will be handled by the POS in the same way as a connectivity issue
        # to allow the user to continue working.
        raise RescueSessionUnavailableError(
            _(
                "This PoS session has been closed and the rescue session is "
                "disabled for this PoS."
            )
        )
