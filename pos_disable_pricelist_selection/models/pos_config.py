from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    hide_pricelist_button = fields.Boolean(
        default=False,
        string="Hide Pricelist Button",
        help="If enabled, the pricelist selection button will be hidden in the PoS interface.",
    )
