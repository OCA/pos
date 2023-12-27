from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_payment_credit_limit_restricted_ids = fields.Many2many(
        related="pos_config_id.payment_credit_limit_restricted_ids",
        readonly=False,
    )
