from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    logout_timeout = fields.Integer(
        default=10,
        string="Logout Timeout",
        help="Timeout (sec) for automatic session logout in this POS",
    )
