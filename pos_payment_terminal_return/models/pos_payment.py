from odoo import fields, models


class PosPayment(models.Model):
    _inherit = "pos.payment"

    payment_terminal_return_message = fields.Char()
