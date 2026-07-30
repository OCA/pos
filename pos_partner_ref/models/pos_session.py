# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class POSSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_res_partner(self):
        res = super()._loader_params_res_partner()
        res["search_params"]["fields"].append("ref")
        return res

    def get_pos_ui_res_partner_by_params(self, custom_search_params):
        if custom_search_params and "domain" in custom_search_params:
            search_query = [
                condition[2]
                for condition in custom_search_params["domain"]
                if condition[0] == "parent_name"
            ]
            if search_query and search_query[0]:
                existing_domain = custom_search_params["domain"]
                new_condition = ("ref", "ilike", search_query[0])
                custom_search_params["domain"] = (
                    ["|"] + existing_domain + [new_condition]
                )
        return super().get_pos_ui_res_partner_by_params(custom_search_params)
