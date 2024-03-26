# Copyright 2021 Camptocamp (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_iface_event_sale = fields.Boolean(
        related="pos_config_id.iface_event_sale", readonly=False
    )
    pos_iface_available_event_stage_ids = fields.Many2many(
        related="pos_config_id.iface_available_event_stage_ids", readonly=False
    )
    pos_iface_available_event_type_ids = fields.Many2many(
        related="pos_config_id.iface_available_event_type_ids", readonly=False
    )
    pos_iface_available_event_tag_ids = fields.Many2many(
        related="pos_config_id.iface_available_event_tag_ids", readonly=False
    )
    pos_iface_event_seats_available_warning = fields.Integer(
        related="pos_config_id.iface_event_seats_available_warning", readonly=False
    )
    pos_iface_event_load_days_before = fields.Integer(
        related="pos_config_id.iface_event_load_days_before", readonly=False
    )
    pos_iface_event_load_days_after = fields.Integer(
        related="pos_config_id.iface_event_load_days_after", readonly=False
    )
