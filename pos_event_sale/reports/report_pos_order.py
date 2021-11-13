# Copyright 2021 Camptocamp (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrderReport(models.Model):
    _inherit = "report.pos.order"

    event_ticket_id = fields.Many2one(
        comodel_name="event.event.ticket",
        string="Event Ticket",
        readonly=True,
    )
    event_id = fields.Many2one(
        comodel_name="event.event",
        string="Event",
        readonly=True,
    )

    def _select(self):
        res = super()._select()
        return f"""
            {res},
            l.event_ticket_id AS event_ticket_id,
            event_event_ticket.event_id AS event_id
        """

    def _from(self):
        res = super()._from()
        return f"""
            {res}
            LEFT JOIN event_event_ticket ON (l.event_ticket_id = event_event_ticket.id)
        """

    def _group_by(self):
        res = super()._group_by()
        return f"""
            {res},
            l.event_ticket_id,
            event_event_ticket.event_id
        """
