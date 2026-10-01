from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    allow_reorder = fields.Boolean(default=True)
