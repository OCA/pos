# Copyright 2024 Tecnativa - Carlos Lopez
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        res = super()._loader_params_product_product()
        res["search_params"]["fields"].append("supplier_data_json")
        return res
