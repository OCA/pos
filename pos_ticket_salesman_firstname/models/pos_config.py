from odoo import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    receipt_salesman_firstname = fields.Boolean(
        "Print only the salesman's first name",
        default=True,
    )
