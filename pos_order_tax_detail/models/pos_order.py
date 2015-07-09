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

from openerp import models, fields, api
import logging

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = 'pos.order'

    taxes = fields.One2many(comodel_name='pos.order.tax',
                            inverse_name='pos_order')

    @api.multi
    def compute_tax_detail(self):
        for order in self:
            taxes_to_delete = self.env['pos.order.tax'].search(
                [('pos_order', '=', order.id)])
            if order.lines:
                taxes = order.lines.taxes_get()
                for key, tax in taxes.iteritems():
                    current = taxes_to_delete.filtered(
                        lambda r: r.tax.id == tax['id'])
                    if current:
                        current.write({
                            'base': tax['base'],
                            'amount': tax['amount'],
                        })
                        taxes_to_delete -= current
                    else:
                        self.env['pos.order.tax'].create({
                            'pos_order': order.id,
                            'tax': tax['id'],
                            'name': tax['name'],
                            'base': tax['base'],
                            'amount': tax['amount'],
                        })

            if taxes_to_delete:
                taxes_to_delete.unlink()
        return True

    @api.multi
    def action_paid(self):
        super(PosOrder, self).action_paid()
        self.compute_tax_detail()
        return True

    @api.model
    def _install_tax_detail(self):
        """Create tax details to pos.order's already paid, done or invoiced.
        """
        # Find orders with state : paid, done or invoiced
        orders = self.search([('state', 'in', ('paid', 'done', 'invoiced'))])
        # Compute tax detail
        orders.compute_tax_detail()
        _logger.info("%d orders computed installing module.", len(orders))
