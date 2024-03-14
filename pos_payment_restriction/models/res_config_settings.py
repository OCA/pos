from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_payment_amount_readonly = fields.Boolean(
        related="pos_config_id.payment_amount_readonly",
        readonly=False,
    )
