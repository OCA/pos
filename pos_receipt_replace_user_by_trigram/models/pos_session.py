# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import models


class POSSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_res_users(self):
        res = super()._loader_params_res_users()
        res["search_params"]["fields"].extend(["pos_trigram"])
        return res
