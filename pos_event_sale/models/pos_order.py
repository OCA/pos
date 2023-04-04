# Copyright 2021 Camptocamp (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

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
        action = self.env["ir.actions.actions"]._for_xml_id(
            "event.event_registration_action_tree"
        )
        action["domain"] = [("pos_order_id", "in", self.ids)]
        return action

    def action_pos_order_paid(self):
        res = super().action_pos_order_paid()
        self.lines._cancel_refunded_event_registrations()
        to_confirm = self.event_registration_ids.filtered(lambda r: r.state == "draft")
        to_confirm.action_confirm()
        to_confirm._action_set_paid()
        return res

    def action_pos_order_cancel(self):
        res = super().action_pos_order_cancel()
        to_cancel = self.event_registration_ids.filtered(lambda r: r.state != "done")
        to_cancel.action_cancel()
        return res

    def unlink(self):
        self.event_registration_ids.unlink()
        return super().unlink()
