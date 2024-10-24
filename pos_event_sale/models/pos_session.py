##############################################################################
# Copyright (c) 2023 braintec AG (https://braintec.com)
# All Rights Reserved
#
# Licensed under the AGPL-3.0 (http://www.gnu.org/licenses/agpl.html).
# See LICENSE file for full licensing details.
##############################################################################

from odoo import api, fields, models
from odoo.tools import date_utils


class PosSession(models.Model):
    _inherit = "pos.session"

    @api.model
    def _pos_ui_models_to_load(self):
        models_to_load = super()._pos_ui_models_to_load()
        models_to_load.extend(
            [
                "event.event",
                "event.event.ticket",
                "event.tag.category",
                "event.tag",
            ]
        )
        return models_to_load

    def _get_pos_ui_event_event(self, params):
        if self.config_id.iface_event_sale:
            return self.env["event.event"].search_read(**params["search_params"])
        return []

    def _loader_params_event_event(self):
        domain = [
            ("company_id", "in", (False, self.config_id.company_id[0].id)),
            ("event_ticket_ids.product_id.active", "=", True),
            ("event_ticket_ids.available_in_pos", "=", True),
        ]

        if self.config_id.iface_available_event_stage_ids:
            event_stage_ids = self.config_id.iface_available_event_stage_ids
            domain.append(("stage_id", "in", event_stage_ids.ids))

        if self.config_id.iface_available_event_type_ids:
            event_type_ids = self.config_id.iface_available_event_type_ids
            domain.append(("event_type_id", "in", event_type_ids))

        if self.config_id.iface_available_event_tag_ids:
            event_tag_ids = self.config_id.iface_available_event_tag_ids
            domain.append(("tag_ids", "in", event_tag_ids))

        if self.config_id.iface_event_load_days_before >= 0:
            date_end = date_utils.subtract(
                fields.Date.today(), self.config_id.iface_event_load_days_before, "days"
            )
            domain.append(("date_end", ">=", date_end))

        if self.config_id.iface_event_load_days_after >= 0:
            date_start = date_utils.add(
                fields.Date.today(), self.config_id.iface_event_load_days_after, "days"
            )
            domain.append(("date_start", "<=", date_start))

        fields_list = [
            "name",
            "display_name",
            "event_type_id",
            "tag_ids",
            "country_id",
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

    def _get_pos_ui_event_event_ticket(self, params):
        if self.config_id.iface_event_sale:
            return self.env["event.event.ticket"].search_read(**params["search_params"])
        return []

    def _loader_params_event_event_ticket(self):
        domain = [
            ("product_id.active", "=", True),
            ("available_in_pos", "=", True),
        ]

        fields_list = [
            "name",
            "description",
            "event_id",
            "product_id",
            "price",
            "seats_limited",
            "seats_available",
        ]

        return {
            "search_params": {
                "domain": domain,
                "fields": fields_list,
            },
        }

    def _get_pos_ui_event_tag_category(self, params):
        if self.config_id.iface_event_sale:
            return self.env["event.tag.category"].search_read(**params["search_params"])
        return []

    def _loader_params_event_tag_category(self):
        return {
            "search_params": {
                "domain": [],
                "fields": [
                    "name",
                ],
            },
        }

    def _get_pos_ui_event_tag(self, params):
        if self.config_id.iface_event_sale:
            return self.env["event.tag"].search_read(**params["search_params"])
        return []

    def _loader_params_event_tag(self):
        return {
            "search_params": {
                "domain": [],
                "fields": [
                    "name",
                    "category_id",
                    "color",
                ],
            },
        }

    def _loader_params_product_product(self):
        params = super()._loader_params_product_product()
        params["search_params"]["fields"].append("detailed_type")
        return params
