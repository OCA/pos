# Copyright 2022 KMEE
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class PosOrderLine(models.Model):

    _inherit = "pos.order.line"

    discount_reason_id = fields.Many2one(
        string="Discount Reason",
        comodel_name="pos.discount.reason",
        readonly=True,
    )
