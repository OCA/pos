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


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    @api.one
    @api.depends('tax_ids', 'qty', 'price_unit',
                 'product_id', 'discount', 'order_id.partner_id')
    def _amount_line_all(self):
        price = self.price_unit * (1 - (self.discount or 0.0) / 100.0)
        taxes = self.tax_ids.compute_all(
            price, self.qty, product=self.product_id,
            partner=self.order_id.partner_id)
        self.price_subtotal = taxes['total']
        self.price_subtotal_incl = taxes['total_included']

    tax_ids = fields.Many2many(
        'account.tax', 'pline_tax_rel', 'pos_line_id', 'tax_id',
        "Taxes", domain=[('type_tax_use', '=', 'sale')])
    price_subtotal = fields.Float(compute="_amount_line_all", store=True)
    price_subtotal_incl = fields.Float(compute="_amount_line_all", store=True)


class PosOrder(models.Model):
    _inherit = "pos.order"

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

