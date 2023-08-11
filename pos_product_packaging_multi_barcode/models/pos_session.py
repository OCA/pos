# Copyright 2023 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_packaging(self):
        result = super()._loader_params_product_packaging()
        result["search_params"]["fields"].append("barcodes_json")
        return result
