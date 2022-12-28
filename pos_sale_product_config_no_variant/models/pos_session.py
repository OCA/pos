# Copyright (C) 2022 Open Source Integrators (https://www.opensourceintegrators.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_pos_order_line(self):
        result = super()._loader_params_product_attribute_value()
        result["search_params"]["fields"].append(
            "product_no_variant_attribute_value_ids"
        )
        return result
