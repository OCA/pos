# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosSessionProductControl(models.Model):

    _name = "pos.session.product.control"
    _description = "Pos Session Product Control"

    product_id = fields.Many2one("product.product", string="Product")

    session_id = fields.Many2one("pos.session", string="Session")

    product_real_start_value = fields.Float("Starting Value")

    product_real_end_value = fields.Float("End Value")

    product_real_balance_value = fields.Float(
        "Product Difference", compute="_compute_product_difference"
    )

    product_inventory_start_value = fields.Float("Starting Inventory Value")

    product_inventory_end_value = fields.Float("End Inventory Value")

    product_inventory_balance_value = fields.Float(
        "Product Inventory Difference", compute="_compute_product_difference"
    )

    @api.depends("product_real_start_value", "product_real_end_value")
    def _compute_product_difference(self):
        for record in self:
            real_start_value = record["product_real_start_value"]
            real_end_value = record["product_real_end_value"]
            inventory_start_value = record["product_inventory_start_value"]
            inventory_end_value = record["product_inventory_end_value"]
            record["product_real_balance_value"] = real_start_value - real_end_value
            record["product_inventory_balance_value"] = (
                inventory_start_value - inventory_end_value
            )
