# Copyright 2022 KMEE
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosDiscountReason(models.Model):

    _name = "pos.discount.reason"
    _description = "Pos Discount Reason"

    _order = "sequence, id"

    name = fields.Char()
    active = fields.Boolean(default=True)
    sequence = fields.Integer(
        default=10,
    )
    percent = fields.Float(string="Discount (%)")
    discount_use = fields.Selection(
        selection=[
            ("order", "Order"),
            ("line", "Line"),
            ("both", "Both"),
        ],
        default="both",
        string="Discount Use",
    )

    @api.constrains("percent")
    def _check_discount_perc(self):
        for record in self:
            if record.percent > 1 or record.percent < 0:
                raise ValidationError(
                    _("The discount percentage must be between 0 and 100")
                )
