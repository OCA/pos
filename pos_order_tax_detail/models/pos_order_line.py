# -*- coding: utf-8 -*-
# Python source code encoding : https://www.python.org/dev/peps/pep-0263/
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright :
#        (c) 2015 Antiun Ingenieria, SL (Madrid, Spain, http://www.antiun.com)
#                 Antonio Espinosa <antonioea@antiun.com>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
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

from openerp import models, api


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    @api.multi
    def taxes_get(self):
        all_taxes = {}
        for line in self:
            taxes_ids = line.product_id.taxes_id.filtered(
                lambda r: r.company_id == line.order_id.company_id)
            price = line.price_unit * (1 - (line.discount or 0.0) / 100.0)
            base = price * line.qty
            taxes = taxes_ids.compute_all(
                price, line.qty, product=line.product_id,
                partner=line.order_id.partner_id or False)['taxes']
            for tax in taxes:
                key = str(tax['id'])
                if key in all_taxes:
                    all_taxes[key]['base'] += base
                    all_taxes[key]['amount'] += tax['amount']
                else:
                    all_taxes[key] = {
                        'id': tax['id'],
                        'name': tax['name'],
                        'base': base,
                        'amount': tax['amount'],
                    }
        return all_taxes
