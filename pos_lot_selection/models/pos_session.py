# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        result = super()._loader_params_product_product()
        result["search_params"]["fields"].append("available_lot_for_pos_ids")
        return result

    def get_pos_ui_product_product_by_params(self, custom_search_params):
        return super(
            PosSession, self.with_company(self.company_id.id)
        ).get_pos_ui_product_product_by_params(custom_search_params)
