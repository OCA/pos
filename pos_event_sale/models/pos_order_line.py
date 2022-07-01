# Copyright 2021 Camptocamp (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    event_ticket_id = fields.Many2one(
        comodel_name="event.event.ticket",
        string="Event Ticket",
        readonly=True,
    )
    event_id = fields.Many2one(
        comodel_name="event.event",
        string="Event",
        related="event_ticket_id.event_id",
        store=True,
        readonly=True,
    )
    event_registration_ids = fields.One2many(
        comodel_name="event.registration",
        inverse_name="pos_order_line_id",
        string="Event Registrations",
        readonly=True,
    )
    # Make currency_id stored in order to compute
    # :meth:`event_event._compute_sale_price_subtotal`
    currency_id = fields.Many2one(store=True)

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        records._create_event_registrations()
        records._cancel_refunded_event_registrations()
        return records

    def _prepare_event_registration_vals(self):
        self.ensure_one()
        vals = {
            "pos_order_line_id": self.id,
            "event_ticket_id": self.event_ticket_id.id,
            "event_id": self.event_id.id,
            "partner_id": self.order_id.partner_id.id,
            "name": self.order_id.partner_id.name,
            "email": self.order_id.partner_id.email,
            "state": "draft",
        }
        return vals

    def _prepare_refund_data(self, refund_order, PosOrderLineLot):
        # OVERRIDE to add the event the event.ticket info to refunds
        res = super()._prepare_refund_data(refund_order, PosOrderLineLot)
        if self.event_ticket_id:
            res["event_ticket_id"] = self.event_ticket_id.id
        return res

    def _create_event_registrations(self):
        """Create the missing event.registrations for this order line"""
        registrations = self.env["event.registration"]
        for line in self:
            if not line.event_ticket_id:  # pragma: no cover
                continue
            qty_existing = len(
                line.event_registration_ids.filtered(lambda r: r.state != "cancel")
            )
            qty_to_create = max(0, int(line.qty) - qty_existing)
            if not qty_to_create:  # pragma: no cover
                continue
            vals = line._prepare_event_registration_vals()
            vals_list = [vals.copy() for __ in range(0, qty_to_create)]
            registrations += self.env["event.registration"].create(vals_list)
        return registrations

    def _cancel_refunded_event_registrations(self):
        """Cancel refunded event registrations"""
        for line in self:
            if not line.event_ticket_id or not line.refunded_orderline_id:
                continue
            to_cancel_qty = max(0, -int(line.qty))
            open_registrations = (
                line.refunded_orderline_id.event_registration_ids.filtered(
                    lambda reg: reg.state == "open"
                )
            )
            to_cancel_registrations = open_registrations[-to_cancel_qty:]
            to_cancel_registrations.action_cancel()
            for registration in to_cancel_registrations:
                registration.message_post(
                    body=_("Refunded on %s", line.order_id.session_id.name)
                )

    def _export_for_ui(self, orderline):
        # OVERRIDE to add event_ticket_id
        res = super()._export_for_ui(orderline)
        res["event_ticket_id"] = orderline.event_ticket_id.id
        res["event_registration_ids"] = orderline.event_registration_ids.ids
        return res
