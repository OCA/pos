from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_ship_later_default = fields.Boolean(
        related="pos_config_id.ship_later_default",
        readonly=False,
    )
    pos_ship_later_delivery_delay = fields.Integer(
        related="pos_config_id.ship_later_delivery_delay",
        readonly=False,
    )
    pos_hide_ship_later_button = fields.Boolean(
        related="pos_config_id.hide_ship_later_button",
        readonly=False,
    )
