# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosSessionProductControl(models.Model):

    _name = "pos.session.product.control"
    _description = "Pos Session Product Control"

    product_id = fields.Many2one("product.product", string="Product")

    session_id = fields.Many2one("pos.session", string="Session")

    product_register_start_value = fields.Float("Starting Value")

    product_register_end_value = fields.Float("End Value")

    product_register_balance_value = fields.Float(
        "Product Difference", compute="_compute_product_difference"
    )

    @api.depends("product_register_start_value", "product_register_end_value")
    def _compute_product_difference(self):
        for record in self:
            start_value = record["product_register_start_value"]
            end_value = record["product_register_end_value"]
            record["product_register_balance_value"] = end_value - start_value
