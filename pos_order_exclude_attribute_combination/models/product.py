# Copyright (C) 2022 Open Source Integrators (https://www.opensourceintegrators.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    def get_product_attribute_value(self, attribute_values):
        return self.env["product.template.attribute.value"].search(
            [
                ("product_attribute_value_id", "in", attribute_values),
                ("product_tmpl_id", "=", self.id),
            ]
        )

    def get_product_info(self, product_id, combination):
        combination = self.get_product_attribute_value(combination)
        return self._is_combination_possible(
            combination=combination, parent_combination=combination
        )
