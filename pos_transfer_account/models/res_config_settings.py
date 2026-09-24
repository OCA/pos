from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_suspense_account_id = fields.Many2one(
        "account.account",
        related="pos_config_id.suspense_account_id",
        readonly=False,
    )
