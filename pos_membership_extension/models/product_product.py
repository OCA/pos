# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import models


class ProductProduct(models.Model):
    _inherit = "product.product"

    def get_product_info_pos(self, price, quantity, pos_config_id):
        res = super().get_product_info_pos(price, quantity, pos_config_id)

        res["allowed_membership_categories"] = [
            {"name": category.name} for category in self.allowed_membership_category_ids
        ]

        return res
