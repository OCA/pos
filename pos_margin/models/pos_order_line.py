# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, fields, models
import openerp.addons.decimal_precision as dp


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    # Columns Section
    margin = fields.Float(
        'Margin', compute='_compute_multi_margin', store=True,
        multi='multi_margin',
        digits_compute=dp.get_precision('Product Price'))

    margin_percent = fields.Float(
        'Margin (%)', compute='_compute_multi_margin', store=True,
        multi='multi_margin',
        digits_compute=dp.get_precision('Product Price'))

    purchase_price = fields.Float(
        'Cost Price', digits_compute=dp.get_precision('Product Price'))

    # Onchange Section
    @api.multi
    def onchange_product_id(
            self, pricelist, product_id, qty=0, partner_id=False):
        product_obj = self.env['product.product']
        res = super(PosOrderLine, self).onchange_product_id(
            pricelist, product_id, qty=qty, partner_id=partner_id)
        if product_id:
            product = product_obj.browse(product_id)
            res['value']['purchase_price'] = product.standard_price
        return res

    # Compute Section
    @api.multi
    @api.depends('purchase_price', 'qty', 'price_subtotal')
    def _compute_multi_margin(self):
        for line in self:
            tmp_margin = line.price_subtotal - (line.purchase_price * line.qty)
            line.update({
                'margin': tmp_margin,
                'margin_percent': (
                    tmp_margin / line.price_subtotal * 100.0 if
                        line.price_subtotal else 0.0),
            })

    # Overload Section. necessary, to manage pos order line creation from
    # create_from_ui, because onchange section is not raised
    @api.model
    def create(self, vals):
        if not vals.get('purchase_price', False):
            product_obj = self.env['product.product']
            product = product_obj.browse(vals.get('product_id'))
            vals['purchase_price'] = product.standard_price
        return super(PosOrderLine, self).create(vals)
