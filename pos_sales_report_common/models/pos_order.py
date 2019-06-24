# Copyright 2019 Martronic SA (https://www.martronic.ch)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields

class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    price_subtotal = fields.Float(compute='_compute_amount_line_all', digits=0, string='Subtotal w/o Tax', store=True)
    price_subtotal_incl = fields.Float(compute='_compute_amount_line_all', digits=0, string='Subtotal', store=True)
