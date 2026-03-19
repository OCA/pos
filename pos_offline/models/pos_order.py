import logging

from odoo import _, api, models
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _get_valid_session(self, order):
        """Override to create rescue session automatically for offline orders.

        When a POS operates offline, orders may arrive after the original
        session has been closed. Instead of raising an error, we create
        a rescue session automatically.
        """
        PosSession = self.env["pos.session"]
        closed_session = PosSession.browse(order["session_id"])

        if not closed_session.exists():
            _logger.error(
                "Session ID %s does not exist for order %s",
                order["session_id"],
                order.get("name", "Unknown"),
            )
            raise UserError(
                _(
                    "Cannot process offline order %(order)s: "
                    "the original session (ID %(session)s) no longer exists.",
                    order=order.get("name", "Unknown"),
                    session=order["session_id"],
                )
            )

        if closed_session.state not in ("closed", "closing_control"):
            # Session is still open, delegate to core logic
            return super()._get_valid_session(order)

        _logger.warning(
            "Session %s (ID: %s) was closed but received offline order %s "
            "(total: %s)",
            closed_session.name,
            closed_session.id,
            order.get("name", "Unknown"),
            order.get("amount_total", 0),
        )

        # Try to find an existing open session for this config
        open_session = PosSession.search(
            [
                ("state", "not in", ("closed", "closing_control")),
                ("config_id", "=", closed_session.config_id.id),
            ],
            limit=1,
        )

        if open_session:
            _logger.warning(
                "Using open session %s for saving offline order %s",
                open_session.name,
                order.get("name", "Unknown"),
            )
            return open_session

        # Create rescue session automatically
        rescue_session = PosSession._create_rescue_session(closed_session)
        return rescue_session

    @api.model
    def sync_from_ui(self, orders):
        """Override to handle idempotent sync for offline orders.

        When orders are synced from offline, the same order may be sent
        multiple times. We detect duplicates by UUID and skip them.
        """
        filtered_orders = []
        for order in orders:
            order_uuid = order.get("uuid")
            if order_uuid:
                existing = self.search(
                    [("uuid", "=", order_uuid), ("state", "!=", "draft")],
                    limit=1,
                )
                if existing:
                    _logger.info(
                        "Skipping duplicate offline order %s (UUID: %s, "
                        "existing ID: %s)",
                        order.get("name", "Unknown"),
                        order_uuid,
                        existing.id,
                    )
                    continue
            filtered_orders.append(order)

        if not filtered_orders:
            # Return empty result in the expected format
            return {
                "pos.order": [],
                "pos.session": [],
                "pos.payment": [],
                "pos.order.line": [],
                "pos.pack.operation.lot": [],
                "product.attribute.custom.value": [],
            }

        return super().sync_from_ui(filtered_orders)
