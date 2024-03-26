# Copyright 2021 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    event_session_id = fields.Many2one(
        comodel_name="event.session",
        string="Event Session",
        readonly=True,
    )

    def _prepare_event_registration_vals(self):
        res = super()._prepare_event_registration_vals()
        res["session_id"] = self.event_session_id.id
        return res

    def _prepare_refund_data(self, refund_order, PosOrderLineLot):
        # OVERRIDE to add the event the event.session info to refunds
        res = super()._prepare_refund_data(refund_order, PosOrderLineLot)
        if self.event_session_id:
            res["event_session_id"] = self.event_session_id.id
        return res

    def _find_event_registrations_to_negate(self):
        # OVERRIDE to match also by event_session_id
        return (
            super()
            ._find_event_registrations_to_negate()
            .filtered(lambda r: r.session_id == self.event_session_id)
        )

    def _export_for_ui(self, orderline):
        # OVERRIDE to add event_session_id
        res = super()._export_for_ui(orderline)
        res["event_session_id"] = orderline.event_session_id.id
        return res
