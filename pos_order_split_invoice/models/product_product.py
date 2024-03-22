# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class ProductProduct(models.Model):
    _inherit = "product.product"

    def get_product_info_pos(self, *args, **kwargs):
        """We add this in order to get the real total price"""
        return super(
            ProductProduct, self.with_context(pos_get_total_price=True)
        ).get_product_info_pos(*args, **kwargs)
