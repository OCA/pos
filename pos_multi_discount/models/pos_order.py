from odoo import fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    manual_discount = fields.Float("Manual Discount")
