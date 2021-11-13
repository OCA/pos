# Copyright 2021 Camptocamp SA - Iván Todorovich
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_event_sale = fields.Boolean(
        "Sell Events",
        default=True,
    )
    iface_available_event_type_ids = fields.Many2many(
        "event.type",
        string="Available Event Types",
        help="Leave empty to load all events",
    )
    iface_event_seats_available_warning = fields.Integer(
        "Event Seats Available Warning",
        help="Display a warning when available seats is below this quantity.",
        default=10,
    )
    iface_load_past_events = fields.Boolean(
        string="Load Past Events",
        help="If not enabled, only events that haven't finished will be loaded.",
    )
