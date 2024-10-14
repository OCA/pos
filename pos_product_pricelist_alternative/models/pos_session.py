# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_pricelist(self):
        result = super()._loader_params_product_pricelist()
        result["search_params"]["fields"].extend(["alternative_pricelist_ids"])
        return result

    def _product_pricelist_item_fields(self):
        result = super()._product_pricelist_item_fields()
        result.extend(["alternative_pricelist_policy"])
        return result
