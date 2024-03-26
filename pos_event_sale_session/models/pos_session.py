from odoo import api, fields, models
from odoo.tools import date_utils

class PosSession(models.Model):
    _inherit = "pos.session"

    @api.model
    def _pos_ui_models_to_load(self):
        models_to_load = super()._pos_ui_models_to_load()
        models_to_load.append("event.session")
        return models_to_load
    
    def _get_pos_ui_event_session(self, params):
        if self.config_id.iface_event_sale:
           return self.env["event.session"].search_read(**params["search_params"])
        return []
    
    def _loader_params_event_session(self):
        domain = [

        ]

        if self.config_id.iface_available_event_stage_ids:
            event_stage_ids = self.config_id.iface_available_event_stage_ids
            domain.append(("stage_id", "in", event_stage_ids.ids))

        if self.config_id.iface_event_load_days_before >= 0:
            date_end = date_utils.subtract(
                fields.Date.today(), self.config_id.iface_event_load_days_before, "days"
            )
            domain.append(("date_end", ">=", date_end))

        if self.config_id.iface_event_load_days_after >= 0:
            date_start = date_utils.add(
                fields.Date.today(), self.config_id.iface_event_load_days_after, "days"
            )
            domain.append(("date_begin", "<=", date_start))

        fields_list = [
            "event_id",
            "display_name",
            "date_begin",
            "date_end",
            "date_tz",
            "seats_limited",
            "seats_available",
        ]

        return {
            "search_params": {
                "domain": domain,
                "fields": fields_list,
            },
        }

    def _loader_params_event_event(self):
        params = super()._loader_params_event_event()
        params["search_params"]["fields"].append("use_sessions")
        return params
