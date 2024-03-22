# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_res_partner(self):
        res = super()._loader_params_res_partner()
        # Add addresses fields
        res["search_params"]["fields"] += [
            "contact_address",
            "partner_latitude",
            "partner_longitude",
        ]
        return res
