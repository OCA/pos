from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    is_zipcode_required = fields.Boolean(string="Is ZIP Code Required")
