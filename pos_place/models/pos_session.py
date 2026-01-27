# Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import _, models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _pos_data_process(self, loaded_data):
        super()._pos_data_process(loaded_data)
        loaded_data["pos.place"] = [
            {"id": False, "code": "", "name": _("No Place")}
        ] + loaded_data["pos.place"]
        loaded_data["place_by_id"] = {
            place["id"]: place for place in loaded_data["pos.place"]
        }
        loaded_data["enable_place"] = self.env.user.has_group(
            "pos_place.group_pos_place_user"
        )
        return

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        result.append("pos.place")
        return result

    def _loader_params_pos_place(self):
        return {
            "search_params": {
                "fields": ["code", "name"],
            },
        }

    def _get_pos_ui_pos_place(self, params):
        return self.env["pos.place"].search_read(**params["search_params"])
