import logging

from odoo import models

_logger = logging.getLogger(__name__)


class PosSession(models.Model):
    _inherit = "pos.session"

    def _get_rescue_session_values(self, closed_session):
        """Return values for creating a rescue session from a closed one.

        This ensures the rescue session inherits proper starting balances
        and sequence numbers from the original session.
        """
        return {
            "config_id": closed_session.config_id.id,
            "user_id": closed_session.user_id.id,
            "cash_register_balance_start": closed_session.cash_register_balance_end,
            "sequence_number": closed_session.sequence_number,
        }

    def _create_rescue_session(self, closed_session):
        """Create a rescue session when orders arrive for a closed session.

        This is called during sync_from_ui when a session has been closed
        but pending offline orders still reference it.
        """
        values = self._get_rescue_session_values(closed_session)
        rescue_session = self.sudo().create(values)

        # Auto-open the rescue session
        rescue_session.action_pos_session_open()

        _logger.info(
            "Created rescue session %s (ID: %s) for closed session %s (ID: %s)",
            rescue_session.name,
            rescue_session.id,
            closed_session.name,
            closed_session.id,
        )
        return rescue_session
