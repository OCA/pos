from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_self_service = fields.Boolean(
        string="Is Self-Service", help="Use that POS as self-service point"
    )
    origin_x = fields.Integer(
        required=True,
        default=10,
        help="Origin point of the contents in the label, X coordinate.",
    )
    origin_y = fields.Integer(
        required=True,
        default=10,
        help="Origin point of the contents in the label, Y coordinate.",
    )
    label_height = fields.Integer(string="Label Height (mm)", default=20)
    label_width = fields.Integer(string="Label Width (mm)", default=30)
