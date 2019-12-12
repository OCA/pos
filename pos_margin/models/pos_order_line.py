# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models
import odoo.addons.decimal_precision as dp


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    # Columns Section
    margin = fields.Float(
        string='Margin',
        compute='_compute_multi_margin',
        store=True,
        digits=dp.get_precision('Product Price'),
    )

    margin_percent = fields.Float(
        string='Margin (%)',
        compute='_compute_multi_margin',
        store=True,
        digits=dp.get_precision('Product Price'),
    )

    purchase_price = fields.Float(
        string='Cost Price',
        compute='_compute_multi_margin',
        store=True,
        digits=dp.get_precision('Product Price'),
    )

    # Compute Section
    @api.multi
    @api.depends('product_id', 'qty', 'price_subtotal')
    def _compute_multi_margin(self):
        for line in self.filtered('product_id'):
            purchase_price = self._get_purchase_price(line)
            margin = line.price_subtotal - (purchase_price * line.qty)
            line.update({
                'purchase_price': purchase_price,
                'margin': margin,
                'margin_percent': line.price_subtotal and (
                    margin / line.price_subtotal * 100.0),
            })

    @api.model
    def _get_purchase_price(self, line):
        # We call _get_purchase_price from sale_margin module, to reuse
        # computation that handles multi currencies context and UoM
        SaleOrderLine = self.env['sale.order.line']

        # if used in combination with module which does add the uom_id to line
        uom = hasattr(line, 'uom_id') and line.uom_id\
            or line.product_id.uom_id

        return SaleOrderLine._get_purchase_price(
            line.order_id.pricelist_id, line.product_id, uom,
            line.order_id.date_order)['purchase_price']
