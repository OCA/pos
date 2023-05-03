# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_res_partner(self):
        res = super()._loader_params_res_partner()
        res["search_params"]["fields"] += [
            "membership_state",
            "membership_state_text",
        ]
        return res

    def _loader_params_product_product(self):
        res = super()._loader_params_product_product()
        res["search_params"]["fields"] += [
            "membership",
        ]
        return res
