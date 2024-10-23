# Copyright 2023 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    split_invoice_amount = fields.Float()
