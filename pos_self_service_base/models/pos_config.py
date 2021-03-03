from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_self_service = fields.Boolean(
        string="Is Self-Service", help="Use that POS as self-service point"
    )
