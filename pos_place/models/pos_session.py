# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _pos_data_process(self, loaded_data):
        res = super()._pos_data_process(loaded_data)
        loaded_data["place_by_id"] = {
            place["id"]: place for place in loaded_data["pos.place"]
        }
        return res

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        new_model = "pos.place"
        if new_model not in result:
            result.append(new_model)
        return result

    def _loader_params_pos_place(self):
        return {"search_params": {"domain": domain, "fields": ["id", "code", "name"]}}

    def _get_pos_ui_pos_place(self, params):
        return (
            self.env["pos.place"]
            .with_context(**params["context"])
            .search_read(**params["search_params"])
        )
