# Copyright 2021 Camptocamp SA - Iván Todorovich
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrderReport(models.Model):
    _inherit = "report.pos.order"

    event_ticket_id = fields.Many2one(
        "event.event.ticket", string="Event Ticket", readonly=True
    )
    event_id = fields.Many2one("event.event", string="Event", readonly=True)

    def _select(self):
        return ",\n".join(
            [
                super()._select(),
                "l.event_ticket_id AS event_ticket_id",
                "event_event_ticket.event_id AS event_id",
            ]
        )

    def _from(self):
        return "\n".join(
            [
                super()._from(),
                """
                LEFT JOIN event_event_ticket
                    ON (l.event_ticket_id = event_event_ticket.id)
                """,
            ]
        )

    def _group_by(self):
        return ",\n".join(
            [super()._group_by(), "l.event_ticket_id", "event_event_ticket.event_id"]
        )
