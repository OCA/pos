# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models
import openerp.addons.decimal_precision as dp


class PosOrder(models.Model):
    _inherit = 'pos.order'

    # Columns Section
    margin = fields.Float(
        'Margin', compute='_compute_margin', store=True,
        digits=dp.get_precision('Product Price'),
        help="It gives profitability by calculating the difference between"
        " the Unit Price and the cost price.")

    # Compute Section
    @api.multi
    @api.depends('lines.margin')
    def _compute_margin(self):
        for order in self:
            order.margin = sum(order.mapped('lines.margin'))
