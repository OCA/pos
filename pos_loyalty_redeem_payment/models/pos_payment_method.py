from odoo import fields, models


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    used_for_loyalty_program = fields.Boolean(
        string="Used for loyalty program",
        help="In PoS interface, this method allows to redeem a gift card.",
    )
    program_id = fields.Many2one("loyalty.program")
