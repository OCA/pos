# Copyright (C) 2024 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    product_title_min_width = fields.Integer(default=122)
    product_text_font_size = fields.Integer(default=12)
    price_tag_font_size = fields.Integer(default=12)
