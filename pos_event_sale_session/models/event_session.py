# Copyright 2021 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models

class EventSession(models.Model):
    _inherit = "event.session"

    pos_order_line_ids = fields.One2many(
        comodel_name="pos.order.line",
        inverse_name="event_session_id",
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

        This method is similar to :meth:`~_compute_sale_price_subtotal`
        only here we consider sales coming from pos.order.line(s).
        """
        date_now = fields.Datetime.now()
        sale_price_by_session = {}
        if self.ids:
            session_subtotals = self.env["pos.order.line"].read_group(
                [
                    ("event_session_id", "in", self.ids),
                    ("order_id.state", "!=", "cancel"),
                    ("price_subtotal", "!=", 0),
                ],
                ["event_session_id", "currency_id", "price_subtotal:sum"],
                ["event_session_id", "currency_id"],
                lazy=False,
            )
            currency_ids = [
                session_subtotal["currency_id"][0]
                for session_subtotal in session_subtotals
            ]
            company_by_session = {
                session._origin.id or session.id: session.company_id for session in self
            }
            currency_by_event = {
                session._origin.id or session.id: session.currency_id
                for session in self
            }
            currency_by_id = {
                currency.id: currency
                for currency in self.env["res.currency"].browse(currency_ids)
            }
            for session_subtotal in session_subtotals:
                price_subtotal = session_subtotal["price_subtotal"]
                event_session_id = session_subtotal["event_session_id"][0]
                currency_id = session_subtotal["currency_id"][0]
                sale_price = currency_by_event[event_session_id]._convert(
                    price_subtotal,
                    currency_by_id[currency_id],
                    company_by_session[event_session_id],
                    date_now,
                )
                if event_session_id in sale_price_by_session:
                    sale_price_by_session[event_session_id] += sale_price
                else:
                    sale_price_by_session[event_session_id] = sale_price

        for rec in self:
            rec.pos_price_subtotal = sale_price_by_session.get(
                rec._origin.id or rec.id, 0
            )

    def action_view_pos_orders(self):
        action = self.env["ir.actions.actions"]._for_xml_id(
            "point_of_sale.action_pos_pos_form"
        )
        action["domain"] = [
            ("state", "!=", "cancel"),
            ("lines.event_session_id", "in", self.ids),
        ]
        return action
