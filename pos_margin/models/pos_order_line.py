# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models
import openerp.addons.decimal_precision as dp


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    # Columns Section
    margin = fields.Float(
        'Margin', compute='_compute_multi_margin', store=True,
        multi='multi_margin', digits=dp.get_precision('Product Price'))

    purchase_price = fields.Float(
        'Cost Price', compute='_compute_multi_margin', store=True,
        multi='multi_margin', digits=dp.get_precision('Product Price'))

    # Compute Section
    @api.multi
    @api.depends('product_id', 'qty', 'price_subtotal')
    def _compute_multi_margin(self):
        for line in self:
            if not line.product_id:
                line.purchase_price = 0
                line.margin = 0
            else:
                line.purchase_price = line.product_id.standard_price
                line.margin = line.price_subtotal - (
                    line.product_id.standard_price * line.qty)
