# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    date_order = fields.Datetime(copy=False)
    user_id = fields.Many2one(copy=False)
    last_order_preparation_change = fields.Char(copy=False)
    sequence_number = fields.Integer(copy=False)
    session_id = fields.Many2one(copy=False)
    shipping_date = fields.Date(copy=False)
    is_tipped = fields.Boolean(copy=False)
    tip_amount = fields.Float(copy=False)
    ticket_code = fields.Char(copy=False)
