# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        res = super()._loader_params_product_product()
        res["search_params"]["fields"] += ["allowed_membership_category_ids"]
        return res

    def _loader_params_res_partner(self):
        res = super()._loader_params_res_partner()
        res["search_params"]["fields"] += ["membership_category_ids"]
        return res

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        result.append("membership.membership_category")
        return result

    def _loader_params_membership_membership_category(self):
        return {"search_params": {"domain": [], "fields": []}}

    def _get_pos_ui_membership_membership_category(self, params):
        return self.env["membership.membership_category"].search_read(
            **params["search_params"]
        )
