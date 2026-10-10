from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    ship_later_default = fields.Boolean(
        string="Ship Later by Default",
    )
    ship_later_delivery_delay = fields.Integer(
        string="Delivery Delay",
        default=0,
        help="Number of days to add to the current date for the default shipping date.",
    )
    hide_ship_later_button = fields.Boolean(
        help="Prevents the cashier from changing the ship later option."
    )
