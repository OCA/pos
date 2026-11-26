# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import api, models
from odoo.osv.expression import OR, is_leaf


class ProductPackaging(models.Model):
    _inherit = "product.packaging"

    @api.model
    def _load_pos_data_domain(self, data) -> list:
        """
        Find the barcode domain to add packaging that have
        the default level.
        """
        domain = super()._load_pos_data_domain(data)
        new_domain = list()
        for element in domain:
            found = False
            if is_leaf(element):
                if element[0] == "barcode":
                    new_element = OR(
                        [[element], [("packaging_level_id.is_default", "=", True)]]
                    )
                    new_domain.extend(new_element)
                    found = True
            if not found:
                new_domain.append(element)
        return new_domain
