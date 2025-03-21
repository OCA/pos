from odoo import fields, models


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    credit_limit_restricted = fields.Boolean()
