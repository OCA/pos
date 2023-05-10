# Copyright (C) 2022 Open Source Integrators (https://www.opensourceintegrators.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        result = super()._loader_params_product_product()
        result["search_params"]["fields"].append("pos_sequence")
        return result
