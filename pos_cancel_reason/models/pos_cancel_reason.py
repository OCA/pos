# Copyright 2022 KMEE (<http://www.kmee.com.br>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, fields, models
from odoo.exceptions import ValidationError


class PosCancelReason(models.Model):
    _name = "pos.cancel.reason"

    name = fields.Char(
        string="Reason",
        required=True,
    )

    active = fields.Boolean(
        string="Active",
        default=True,
    )

    cancelled_order_line_ids = fields.One2many(
        string="Cancelled Order Lines",
        comodel_name="pos.order.line.cancelled",
        inverse_name="cancel_reason_id",
    )

    order_ids = fields.One2many(
        string="Pos Orders", comodel_name="pos.order", inverse_name="cancel_reason_id"
    )

    def write(self, vals):
        if vals.get("name"):
            if self.cancelled_order_line_ids or self.order_ids:
                raise ValidationError(
                    _("You can't change a reason name " "with cancelled lines created!")
                )

    def unlink(self):
        if self.cancelled_order_line_ids or self.order_ids:
            raise ValidationError(
                _("You can't delete a reason " "with cancelled lines created!")
            )
