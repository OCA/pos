# Copyright 2022 KMEE (<http://www.kmee.com.br>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import re
from typing_extensions import Required
from odoo import _, api, models, fields
from odoo.exceptions import ValidationError


class PosOrderLineCancelled(models.Model):
    _name = 'pos.order.line.cancelled'

    employee_id = fields.Many2one(
        string='Cashier',
        comodel_name='he.employee',
        required=True,
    )
    order_id = fields.Many2one(
        string='Order',
        comodel_name='pos.order',
        required=True,
    )
    product_id = fields.Many2one(
        string='Product',
        comodel_name='product.product',
        required=True,
    )
    price_unit = fields.Float(
        string='Unit Price',
         digits=0,
         required=True,
    )
    qty = fields.Float(
        'Quantity',
        digits='Product Unit of Measure',
        default=1,
        required=True,
    )
    price_subtotal = fields.Float(
        string='Subtotal w/o Tax',
        digits=0,
        readonly=True,
        required=True,
    )
    cancel_reason_id = fields.Many2one(
        string='Reason',
        comodel_name='pos.cancel.reason',
        required=True,
    )

    @api.model
    def cancel_from_ui(self, cancelled_item):
        pos_order = self.env["pos.order"].search([("pos_reference", "=", cancelled_item["order_id"])])
        cancelled_item["order_id"] = pos_order.id
        self.create([cancelled_item])
