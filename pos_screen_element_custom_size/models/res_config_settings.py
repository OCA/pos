# Copyright (C) 2024 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_product_title_min_width = fields.Integer(
        related="pos_config_id.product_title_min_width", readonly=False
    )
    pos_product_text_font_size = fields.Integer(
        related="pos_config_id.product_text_font_size", readonly=False
    )
    pos_price_tag_font_size = fields.Integer(
        related="pos_config_id.price_tag_font_size", readonly=False
    )
