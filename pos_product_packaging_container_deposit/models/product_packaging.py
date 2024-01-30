# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ProductPackaging(models.Model):
    _inherit = "product.packaging"

    # Technical field used in POS frontend
    container_deposit_product_id = fields.Many2one(
        "product.product", related="package_type_id.container_deposit_product_id"
    )
