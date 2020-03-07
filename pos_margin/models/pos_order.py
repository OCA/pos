# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models
import odoo.addons.decimal_precision as dp


class PosOrder(models.Model):
    _inherit = 'pos.order'

    # Columns Section
    margin = fields.Float(
        string='Margin',
        compute='_compute_margin',
        store=True,
        digits=dp.get_precision('Product Price'),
        help="It gives profitability by calculating the difference between"
        " the Unit Price and the cost price.")

    margin_percent = fields.Float(
        string='Margin (%)',
        compute='_compute_margin',
        store=True,
        digits=dp.get_precision('Product Price'),
    )

    # Compute Section
    @api.multi
    @api.depends('lines.margin', 'lines.price_subtotal')
    def _compute_margin(self):
        for order in self:
            tmp_margin = sum(order.mapped('lines.margin'))
            tmp_price_subtotal = sum(order.mapped('lines.price_subtotal'))
            order.update({
                'margin': tmp_margin,
                'margin_percent': tmp_price_subtotal and (
                    tmp_margin / tmp_price_subtotal * 100) or 0.0,
            })
