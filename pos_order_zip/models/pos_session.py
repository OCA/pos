# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _pos_data_process(self, loaded_data):
        res = super()._pos_data_process(loaded_data)
        if self.config_id.is_zipcode_required:
            loaded_data["zip_code"] = {
                orderzip["zip_code"]: orderzip
                for orderzip in loaded_data["order.zipcode"]
            }
        return res

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        if self.config_id.is_zipcode_required:
            new_model = "order.zipcode"
            if new_model not in result:
                result.append(new_model)
        return result

    def _loader_params_order_zipcode(self):
        return {
            "search_params": {"domain": [], "fields": ["zip_code", "id"], "load": False}
        }

    def _get_pos_ui_order_zipcode(self, params):
        return self.env["order.zipcode"].search_read(**params["search_params"])
