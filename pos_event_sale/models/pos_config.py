# Copyright 2021 Camptocamp (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_event_sale = fields.Boolean(
        "Events",
        help="Sell events on this point of sale.",
        default=True,
    )
    iface_available_event_stage_ids = fields.Many2many(
        "event.stage",
        string="Available Event Stages",
        help="Limit the available events for this Point of Sale.\n"
        "Leave empty to load all stages.",
        default=lambda self: self._default_available_event_stage_ids(),
    )
    iface_available_event_type_ids = fields.Many2many(
        "event.type",
        string="Available Event Types",
        help="Limit the available events for this Point of Sale.\n"
        "Leave empty to load all types.",
    )
    iface_available_event_tag_ids = fields.Many2many(
        "event.tag",
        string="Available Event Tags",
        help="Limit the available events for this Point of Sale.\n"
        "Leave empty to load all tags.",
    )
    iface_event_seats_available_warning = fields.Integer(
        "Event Seats Available Warning",
        help="Display a warning when available seats is below this quantity.",
        default=10,
    )
    iface_event_load_days_before = fields.Integer(
        string="Load past events (days)",
        help="Number of days before today, to load past events.\n"
        "Set to -1 to load all past events.",
        default=0,
    )
    iface_event_load_days_after = fields.Integer(
        string="Load future events (days)",
        help="Number of days in the future to load events.\n"
        "Set to -1 to load all future events.",
        default=-1,
    )

    @api.model
    def _default_available_event_stage_ids(self):
        return self.env["event.stage"].search([("pipe_end", "=", False)])
