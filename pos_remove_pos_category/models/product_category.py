# Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import random

from odoo import api, fields, models


class ProductCategory(models.Model):
    _inherit = ["product.category", "pos.load.mixin"]
    _name = "product.category"

    def get_default_color(self):
        return random.randint(0, 10)

    child_ids = fields.One2many(string="POS child categories", related="child_id")
    has_image = fields.Boolean(compute="_compute_has_image")
    color = fields.Integer(required=False, default=get_default_color)
    sequence = fields.Integer(
        help="Gives the sequence order when displaying a list of product categories."
    )

    @api.model
    def _load_pos_data_domain(self, data):
        config_id = self.env["pos.config"].browse(data["pos.config"]["data"][0]["id"])
        domain = (
            [("id", "in", config_id._get_available_categories().ids)]
            if config_id.limit_categories and config_id.iface_available_categ_ids
            else []
        )
        return domain

    @api.model
    def _load_pos_data_fields(self, config_id):
        return [
            "id",
            "name",
            "parent_id",
            "child_ids",
            "write_date",
            "has_image",
            "color",
            "sequence",
        ]

    @api.depends("has_image")
    def _compute_has_image(self):
        for category in self:
            category.has_image = bool(category.image_128)
