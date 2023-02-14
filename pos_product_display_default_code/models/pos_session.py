# Copyright 2023 FactorLibre - Juan Carlos Bonilla
from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        result = super()._loader_params_product_product()
        result["context"]["display_default_code"] = True
        return result
