# Copyright 2026 Tecnativa - David Bañón
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_pos_payment_method(self):
        result = super()._loader_params_pos_payment_method()
        result["search_params"]["fields"].extend(["cashlogy_url", "cashlogy_api_key"])
        return result
