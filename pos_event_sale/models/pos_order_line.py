# Copyright 2021 Camptocamp SA - Iván Todorovich
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    event_ticket_id = fields.Many2one(
        "event.event.ticket", string="Event Ticket", readonly=True
    )
    event_id = fields.Many2one(
        "event.event",
        string="Event",
        related="event_ticket_id.event_id",
        store=True,
        readonly=True,
    )
    event_registration_ids = fields.One2many(
        "event.registration",
        "pos_order_line_id",
        string="Event Registrations",
        readonly=True,
    )

    @api.model
    def create(self, vals):
        res = super().create(vals)
        res._create_event_registrations()
        return res

    def _create_event_registrations(self):
        for line in self.filtered("event_ticket_id"):
            ticket_id = line.event_ticket_id
            vals = {
                "event_ticket_id": ticket_id.id,
                "event_id": ticket_id.event_id.id,
                "partner_id": line.order_id.partner_id.id,
                "name": line.order_id.partner_id.name,
                "email": line.order_id.partner_id.email,
                "origin": line.order_id.name,
                "pos_order_line_id": line.id,
                "state": "draft",
            }
            vals_list = [vals.copy() for i in range(0, int(line.qty))]
            self.env["event.registration"].with_context(
                registration_force_draft=True
            ).create(vals_list)
