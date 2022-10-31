# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):

    _inherit = "pos.config"

    product_control = fields.Boolean("product_control")

    product_ids = fields.Many2many("product.product", string="Products to Control")
