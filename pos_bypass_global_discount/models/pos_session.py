# Copyright 2024 Camptocamp
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import models


class POSSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        params = super()._loader_params_product_product()
        if "search_params" in params and "fields" in params["search_params"]:
            params["search_params"]["fields"].append("bypass_global_discount")
        return params
