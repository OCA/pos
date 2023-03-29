# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrderLine(models.Model):

    _inherit = "pos.order.line"

    product_event_id = fields.Many2one(
        comodel_name="resource.product.event.price", string="Product Event Applied"
    )
