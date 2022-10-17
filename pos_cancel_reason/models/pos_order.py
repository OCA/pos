# Copyright 2022 KMEE (<http://www.kmee.com.br>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosOrder(models.Model):
    _inherit = "pos.order"

    cancelled_line_ids = fields.One2many(
        string="Cancelled Lines",
        comodel_name="pos.order.line.cancelled",
        inverse_name="order_id",
    )

    cancel_reason_id = fields.Many2one(
        string="Cancel Reason", comodel_name="pos.cancel.reason"
    )

    @api.model
    def _order_fields(self, ui_order):
        order_fields = super(PosOrder, self)._order_fields(ui_order)
        if ui_order.get("cancel_reason_id"):
            order_fields["cancel_reason_id"] = ui_order.get("cancel_reason_id")
        if ui_order.get("state") and ui_order["state"] == "cancel":
            order_fields["state"] = ui_order.get("state")
        return order_fields

    @api.model
    def create_from_ui(self, orders, draft=False):
        orders_ids = super(PosOrder, self).create_from_ui(orders)
        for order in orders:
            for cancelled_item in order["data"]["cancelled_orderlines"]:
                if cancelled_item:
                    self.env["pos.order.line.cancelled"].cancel_from_ui(cancelled_item)
        return orders_ids

    def unlink(self):
        if self.cancel_reason_id:
            raise ValidationError(_("You can't delete an order with a cancel reason!"))

        return super(PosOrder, self).unlink()
