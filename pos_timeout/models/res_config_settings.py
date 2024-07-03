from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_order_timeout = fields.Integer(
        related="pos_config_id.pos_order_timeout",
        readonly=False,
    )
