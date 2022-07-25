# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from collections import defaultdict

from odoo import models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    def _prepare_event_registration_vals(self):
        # OVERRIDE to also link the created registrations to the sale_order_line.
        res = super()._prepare_event_registration_vals()
        if self.sale_order_line_id:
            res["sale_order_line_id"] = self.sale_order_line_id.id
        return res

    def _create_event_registrations(self):
        # OVERRIDE to attempt to link existing registrations from sale_order_lines
        # before creating new ones.
        sale_event_lines = self.filtered(
            lambda l: (l.sale_order_line_id and l.product_id.detailed_type == "event")
        )
        if sale_event_lines:
            # Get event.registrations created from Sales and group by sale_order_line
            # Only those that aren't cancelled and already linked to pos lines.
            sale_lines = sale_event_lines.sale_order_line_id
            registrations = self.env["event.registration"].search(
                [
                    ("sale_order_line_id", "in", sale_lines.ids),
                    ("pos_order_line_id", "=", False),
                    ("state", "!=", "cancel"),
                ]
            )
            registrations_by_sale_line = defaultdict(
                lambda: self.env["event.registration"]
            )
            for registration in registrations:
                sale_line = registration.sale_order_line_id
                registrations_by_sale_line[sale_line] += registration
            # Attempt to link N (qty) registrations from sale lines to the pos lines
            # It's possible there aren't enough registrations, but that's ok.
            for pos_line in sale_event_lines:
                sale_line = pos_line.sale_order_line_id
                sale_registrations = registrations_by_sale_line[sale_line].filtered(
                    lambda reg: not reg.pos_order_line_id
                )
                qty = int(min(len(sale_registrations), pos_line.qty))
                if qty:
                    sale_registrations[:qty].pos_order_line_id = pos_line
        # Create the missing registrations
        return super()._create_event_registrations()
