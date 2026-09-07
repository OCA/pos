from odoo import models


class PosShopModel(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        params = super()._loader_params_product_product()
        if "search_params" in params and "fields" in params["search_params"]:
            params["search_params"]["fields"].append("loyalty_exclude")
        return params
