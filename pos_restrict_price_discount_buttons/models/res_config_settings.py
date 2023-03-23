from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    restrict_price_button = fields.Boolean(
        related="pos_config_id.restrict_price_button", readonly=False
    )
    restrict_price_users_ids = fields.Many2many(
        comodel_name="res.users",
        string="Bypass for",
        related="pos_config_id.restrict_price_users_ids",
        readonly=False,
    )

    restrict_discount_button = fields.Boolean(
        related="pos_config_id.restrict_discount_button", readonly=False
    )

    restrict_discount_users_ids = fields.Many2many(
        comodel_name="res.users",
        string="Bypass for",
        related="pos_config_id.restrict_discount_users_ids",
        readonly=False,
    )
