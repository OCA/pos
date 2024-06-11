# Copyright 2021 Camptocamp (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class Event(models.Model):
    _inherit = "event.event"

    pos_order_line_ids = fields.One2many(
        comodel_name="pos.order.line",
        inverse_name="event_id",
        groups="point_of_sale.group_pos_user",
        string="All the PoS Order Lines pointing to this event",
        readonly=True,
    )
    pos_price_subtotal = fields.Monetary(
        string="POS Sales (Tax Excluded)",
        compute="_compute_pos_price_subtotal",
        groups="point_of_sale.group_pos_user",
    )

    @api.depends(
        "currency_id",
        "pos_order_line_ids.price_subtotal",
        "pos_order_line_ids.currency_id",
        "pos_order_line_ids.company_id",
        "pos_order_line_ids.order_id.date_order",
    )
    def _compute_pos_price_subtotal(self):
        """Compute POS Sales Amount

        This method is similar to upstream's :meth:`~_compute_sale_price_subtotal`
        only here we consider sales coming from pos.order.line(s).

        In theory we could merge them both together to compute a total Sales amount,
        coming from both sale.order and pos.order. However, in order to provide two
        separate smart buttons with proper information, one for each model, it's better
        to split them.
        """
        date_now = fields.Datetime.now()
        sale_price_by_event = {}
        if self.ids:
            event_subtotals = self.env["pos.order.line"]._read_group(
                [
                    ("event_id", "in", self.ids),
                    ("order_id.state", "!=", "cancel"),
                    ("price_subtotal", "!=", 0),
                ],
                ["event_id", "currency_id"],
                ["price_subtotal:sum"],
            )
            currency_ids = [
                event_subtotal["currency_id"][0] for event_subtotal in event_subtotals
            ]
            company_by_event = {
                event._origin.id or event.id: event.company_id for event in self
            }
            currency_by_event = {
                event._origin.id or event.id: event.currency_id for event in self
            }
            currency_by_id = {
                currency.id: currency
                for currency in self.env["res.currency"].browse(currency_ids)
            }
            for event_subtotal in event_subtotals:
                price_subtotal = event_subtotal["price_subtotal"]
                event_id = event_subtotal["event_id"][0]
                currency_id = event_subtotal["currency_id"][0]
                sale_price = currency_by_event[event_id]._convert(
                    price_subtotal,
                    currency_by_id[currency_id],
                    company_by_event[event_id],
                    date_now,
                )
                if event_id in sale_price_by_event:
                    sale_price_by_event[event_id] += sale_price
                else:
                    sale_price_by_event[event_id] = sale_price

        for rec in self:
            rec.pos_price_subtotal = sale_price_by_event.get(
                rec._origin.id or rec.id, 0
            )

    def action_view_pos_orders(self):
        action = self.env["ir.actions.actions"]._for_xml_id(
            "point_of_sale.action_pos_pos_form"
        )
        action["domain"] = [
            ("state", "!=", "cancel"),
            ("lines.event_id", "in", self.ids),
        ]
        return action
