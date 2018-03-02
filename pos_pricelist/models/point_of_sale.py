# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2015 Aserti Global Solutions (http://www.aserti.es/).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp import models, fields, api
from openerp.addons import decimal_precision as dp
from openerp.addons.point_of_sale.point_of_sale import pos_order as base_order
from openerp.addons.pos_pricelist.models.pos_order_patch import (
    _create_account_move_line)

import logging
_logger = logging.getLogger(__name__)


class PosOrderTax(models.Model):
    _name = 'pos.order.tax'

    pos_order = fields.Many2one('pos.order', string='POS Order',
                                ondelete='cascade', index=True)
    tax = fields.Many2one('account.tax', string='Tax')
    name = fields.Char(string='Tax Description', required=True)
    base = fields.Float(string='Base', digits=dp.get_precision('Account'))
    amount = fields.Float(string='Amount', digits=dp.get_precision('Account'))


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    @api.multi
    def _compute_taxes(self):
        res = {
            'total': 0,
            'total_included': 0,
            'taxes': [],
        }
        for line in self:
            price = line.price_unit * (1 - (line.discount or 0.0) / 100.0)
            taxes = line.tax_ids.compute_all(
                price, line.qty, product=line.product_id,
                partner=line.order_id.partner_id)
            res['total'] += taxes['total']
            res['total_included'] += taxes['total_included']
            res['taxes'] += taxes['taxes']
        return res

    @api.one
    @api.depends('tax_ids', 'qty', 'price_unit',
                 'product_id', 'discount', 'order_id.partner_id')
    def _amount_line_all(self):
        taxes = self._compute_taxes()
        self.price_subtotal = taxes['total']
        self.price_subtotal_incl = taxes['total_included']

    tax_ids = fields.Many2many(
        'account.tax', 'pline_tax_rel', 'pos_line_id', 'tax_id',
        "Taxes", domain=[('type_tax_use', 'in', ['sale', 'all'])])
    price_subtotal = fields.Float(compute="_amount_line_all", store=True)
    price_subtotal_incl = fields.Float(compute="_amount_line_all", store=True)

    @api.multi
    def onchange_product_id(
            self, pricelist, product_id, qty=0, partner_id=False):
        product_obj = self.env['product.product']
        res = super(PosOrderLine, self).onchange_product_id(
            pricelist, product_id, qty=qty, partner_id=partner_id)
        if product_id:
            product = product_obj.browse(product_id)
            res['value']['tax_ids'] = product.taxes_id.ids
        return res


class PosOrder(models.Model):
    _inherit = "pos.order"

    taxes = fields.One2many(comodel_name='pos.order.tax',
                            inverse_name='pos_order', readonly=True)

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        res.update({'pricelist_id': ui_order['pricelist_id']})
        return res

    @api.model
    def _amount_line_tax(self, line):
        price = line.price_unit * (1 - (line.discount or 0.0) / 100.0)
        taxes = line.tax_ids.compute_all(
            price, line.qty, product=line.product_id,
            partner=line.order_id.partner_id)['taxes']
        val = 0.0
        for c in taxes:
            val += c.get('amount', 0.0)
        return val

    @api.multi
    def _tax_list_get(self):
        agg_taxes = {}
        tax_lines = []
        for order in self:
            for line in order.lines:
                tax_lines.append({
                    'base': line.price_subtotal,
                    'taxes': line._compute_taxes()['taxes']
                })

        for tax_line in tax_lines:
            base = tax_line['base']
            for tax in tax_line['taxes']:
                tax_id = str(tax['id'])
                if tax_id in agg_taxes:
                    agg_taxes[tax_id]['base'] += base
                    agg_taxes[tax_id]['amount'] += tax['amount']
                else:
                    agg_taxes[tax_id] = {
                        'tax_id': tax_id,
                        'name': tax['name'],
                        'base': base,
                        'amount': tax['amount'],
                    }
        return agg_taxes

    @api.multi
    def compute_tax_detail(self):
        taxes_to_delete = False
        for order in self:
            taxes_to_delete = self.env['pos.order.tax'].search(
                [('pos_order', '=', order.id)])
            # Update order taxes list
            for key, tax in order._tax_list_get().iteritems():
                current = taxes_to_delete.filtered(
                    lambda r: r.tax.id == tax['tax_id'])
                if current:
                    current.write({
                        'base': tax['base'],
                        'amount': tax['amount'],
                    })
                    taxes_to_delete -= current
                else:
                    self.env['pos.order.tax'].create({
                        'pos_order': order.id,
                        'tax': tax['tax_id'],
                        'name': tax['name'],
                        'base': tax['base'],
                        'amount': tax['amount'],
                    })
        if taxes_to_delete:
            taxes_to_delete.unlink()

    @api.multi
    def action_paid(self):
        result = super(PosOrder, self).action_paid()
        self.compute_tax_detail()
        return result

    @api.model
    def _install_tax_detail(self):
        """Create tax details to pos.order's already paid, done or invoiced.
        """
        # Find orders with state : paid, done or invoiced
        orders = self.search([('state', 'in', ('paid', 'done', 'invoiced')),
                              ('taxes', '=', False)])
        # Compute tax detail
        orders.compute_tax_detail()
        _logger.info("%d orders computed installing module.", len(orders))

    def _register_hook(self, cr):
        res = super(PosOrder, self)._register_hook(cr)
        base_order._create_account_move_line = _create_account_move_line
        return res
