from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    offline_enabled = fields.Boolean(
        string="Offline Mode",
        default=True,
        help="Enable offline mode for this POS. When enabled, the POS will "
        "cache data locally and continue operating when the network is "
        "unavailable.",
    )
