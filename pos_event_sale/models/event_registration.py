# Copyright 2021 Camptocamp SA - Iván Todorovich
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class EventRegistration(models.Model):
    _inherit = "event.registration"

    pos_order_line_id = fields.Many2one(
        "pos.order.line", string="PoS Order Line", ondelete="cascade"
    )
    pos_order_id = fields.Many2one(
        "pos.order",
        string="Source PoS Order",
        related="pos_order_line_id.order_id",
        ondelete="cascade",
        store=True,
    )
