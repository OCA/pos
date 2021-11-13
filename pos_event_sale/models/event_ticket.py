# Copyright 2021 Camptocamp (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class EventTypeTicket(models.Model):
    _inherit = "event.type.ticket"

    available_in_pos = fields.Boolean(
        related="product_id.available_in_pos",
        help="This is configured on the related Product.\n\n"
        "Please note that for the ticket to be available in the Point of Sale, "
        "the ticket's product has to be available there, too.",
    )


class EventTicket(models.Model):
    _inherit = "event.event.ticket"

    available_in_pos = fields.Boolean(
        related="product_id.available_in_pos",
        help="This is configured on the related Product.\n\n"
        "Please note that for the ticket to be available in the Point of Sale, "
        "the ticket's product has to be available there, too.",
    )
