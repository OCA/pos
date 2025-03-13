# Copyright 2025 Moka
# @author Damien Horvat <damien@moka.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models

class EventEvent(models.Model):
    """Custom model to load inside the POS"""

    _name = "event.event"
    _inherit = ["event.event", "pos.load.mixin"]

    @api.model
    def _load_pos_data_fields(self, config_id):
        """Specify which fields to load in the POS"""

        super()._load_pos_data_fields(config_id)
        return [
            "id",
            "name",
            "date_begin",
            "date_begin_located", 
            "date_end",
            "date_end_located",
            "seats_limited",
            "seats_max",
            "seats_available",
            "address_id",
            "organizer_id",
            "event_type_id",
            "active",
            "company_id",
            "event_ticket_ids",
            "image_1024",
            "tag_ids",
            "question_ids",
            "general_question_ids",
            "specific_question_ids",
            "badge_format",
        ]


class EventEventTicket(models.Model):
    """Custom model to load inside the POS"""

    _name = "event.event.ticket"
    _inherit = ["event.event.ticket", "pos.load.mixin"]

    @api.model
    def _load_pos_data_fields(self, config_id):
        """Specify which fields to load in the POS"""

        super()._load_pos_data_fields(config_id)
        return [
            "name",
            "event_id",
            "product_id",
            "price",
            "seats_max",
            "seats_available",
        ]

class EventTag(models.Model):

    _name = "event.tag"
    _inherit = ["event.tag", "pos.load.mixin"]

    @api.model
    def _load_pos_data_fields(self, config_id):
        """Specify which fields to load in the POS"""

        super()._load_pos_data_fields(config_id)
        return [
            "name",
        ]