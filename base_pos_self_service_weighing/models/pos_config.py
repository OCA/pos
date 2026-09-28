# SPDX-FileCopyrightText: 2023 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    is_self_service_weighing_station = fields.Boolean(
        string="Is a Self-Service Weighing Station",
        help="Use this PoS as a self-service weighing station",
    )
    is_close_session_button_visible = fields.Boolean(
        compute="_compute_is_close_session_button_visible",
    )

    def close_self_service_weighing_session(self):
        """simplified version of close_session_from_ui in pos_session
        this function assumes there will be no pos_orders and thus no account
        moves to post

        If successful, it returns {'successful': True}
        Otherwise, it returns
            {'successful': False, 'message': str, 'redirect': bool}.
            'redirect' is a boolean used in close_session_from_ui to know whether
            to redirect the user to the back end or not. Irrelevant here, but kept
            for consistency.
        """
        self.ensure_one()

        session = self.current_session_id

        validate_result = session.action_pos_session_closing_control()
        # If the return result is a dict, this means that normally we have a
        # redirection or a wizard => we redirect the user
        if isinstance(validate_result, dict):
            return {
                "successful": False,
                "message": validate_result.get("name"),
                "redirect": True,
            }

        # same internal message as close_session_from_ui -> no translation
        # pylint: disable=C8107
        session.message_post(body="Point of Sale Session ended")

        return {"successful": True}

    @api.depends("is_self_service_weighing_station", "session_ids.state")
    def _compute_is_close_session_button_visible(self):
        for record in self:
            record.is_close_session_button_visible = (
                record.is_self_service_weighing_station
                and record.current_session_state in ("opened", "opening_control")
            )
