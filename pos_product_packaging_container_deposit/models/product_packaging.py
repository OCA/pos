# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models
from odoo.tools import groupby

class ProductPackaging(models.Model):
    _inherit = "product.packaging"

    # Technical field used in POS frontend
    container_deposit_product_id = fields.Many2one(
        "product.product", related="package_type_id.container_deposit_product_id"
    )

    container_deposit_product_ids = fields.Many2many(
        "product.product", compute="_compute_product_ids"
    )

    def _compute_product_ids(self):
        for rec in self:
            packagings = rec.product_id.packaging_ids
            container_deposit_product_ids = []
            for plevel, packs in groupby(packagings, lambda p: p.packaging_level_id):
                    container_deposit = packs[
                        0
                    ].package_type_id.container_deposit_product_id
                    if container_deposit:
                        container_deposit_product_ids.append(container_deposit.id)
            rec.container_deposit_product_ids = container_deposit_product_ids