# Copyright 2022 KMEE (<http://www.kmee.com.br>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import re
from typing_extensions import Required
from odoo import _, api, models, fields


class PosOrder(models.Model):
    _inherit = 'pos.order'

    cancelled_line_ids = fields.One2many(
        string='Cancelled Lines',
        comodel_name='pos.order.line.cancelled',
        inverse_name='order_id',
    )

    cancel_reason_id = fields.Many2one(
        string='Cancel Reason',
        comodel_name='pos.cancel.reason'
    )

    @api.model
    def create_from_ui(self, orders, draft=False):
        orders_ids = super(PosOrder, self).create_from_ui(orders)
        for order in orders:
            for cancelled_item in order["data"]["cancelled_orderlines"]:
                if cancelled_item:
                    self.env["pos.order.line.cancelled"].cancel_from_ui(cancelled_item)
        return orders_ids
