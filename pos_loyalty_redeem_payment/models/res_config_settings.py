from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_allow_auto_print_giftcard = fields.Boolean(
        related="pos_config_id.allow_auto_print_giftcard",
        readonly=False,
    )