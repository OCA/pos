from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_self_service = fields.Boolean(
        string="Is Self-Service", help="Use that POS as self-service point"
    )
    label_offset_x = fields.Integer(
        required=True,
        default=320,
        help="Origin point of the contents in the label, X coordinate.",
    )
    label_offset_y = fields.Integer(
        required=True,
        default=40,
        help="Origin point of the contents in the label, Y coordinate.",
    )
    label_height = fields.Integer(string="Label Height (ZPL ^BY command argument)", default=2)
    label_width = fields.Integer(string="Label Width (ZPL ^BY command argument)", default=100)
