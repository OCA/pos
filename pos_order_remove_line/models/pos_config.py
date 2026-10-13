from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    pos_line_remove_btn = fields.Boolean(
        string="Show Remove button on order line", default=False
    )
    pos_line_remove_warning = fields.Boolean(
        string="Warning on removing order lines",
        help="If checked, a warning will be shown when removing order lines",
        default=False,
    )
