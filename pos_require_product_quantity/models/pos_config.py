from odoo import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    require_product_quantity = fields.Boolean(
        string='Require product quantity in POS',
        default=False,
    )
