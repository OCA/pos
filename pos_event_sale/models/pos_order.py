# Copyright 2021 Camptocamp SA - Iván Todorovich
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    event_registrations_count = fields.Integer(
        string="Event Registration Count",
        compute="_compute_event_registrations_count",
    )
    event_registration_ids = fields.One2many(
        "event.registration",
        "pos_order_id",
        string="Event Registrations",
        readonly=True,
    )

    def _compute_event_registrations_count(self):
        count = self.env["event.registration"].read_group(
            [("pos_order_id", "in", self.ids)],
            fields=["pos_order_id"],
            groupby=["pos_order_id"],
        )
        count_map = {x["pos_order_id"][0]: x["pos_order_id_count"] for x in count}
        for rec in self:
            rec.event_registrations_count = count_map.get(rec.id, 0)

    def action_open_event_registrations(self):
        self.ensure_one()
        res = self.env["ir.actions.act_window"].for_xml_id(
            "event", "act_event_registration_from_event"
        )
        res.pop("context", None)
        res["domain"] = [("pos_order_id", "=", self.id)]
        return res

    def action_pos_order_paid(self):
        res = super().action_pos_order_paid()
        self.mapped("lines.event_registration_ids").confirm_registration()
        return res
