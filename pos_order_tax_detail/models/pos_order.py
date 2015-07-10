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

from openerp import models, fields, api, _
from openerp.exceptions import Warning
from openerp.tools.float_utils import float_compare
from openerp.addons import decimal_precision as dp
import logging

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = 'pos.order'

    taxes = fields.One2many(comodel_name='pos.order.tax',
                            inverse_name='pos_order')

    @api.multi
    def compute_tax_detail(self):
        result = True
        precision_digits = dp.get_precision('Account')(self.env.cr)[1]
        for order in self:
            amount_tax = 0
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
                        current = self.env['pos.order.tax'].create({
                            'pos_order': order.id,
                            'tax': tax['id'],
                            'name': tax['name'],
                            'base': tax['base'],
                            'amount': tax['amount'],
                        })
                    amount_tax += current.amount

            if taxes_to_delete:
                taxes_to_delete.unlink()
            # This a weird use case. User has changed taxes assigned to
            # product during POS sessions or when installing this addon
            # some POS order was paid when product has Tax#1, then user changed
            # by Tax#2, and now we do not know that this product has Tax#1 when
            # paid and order.amount_tax (calculated when paid/done) is not the
            # same of sum(taxes). We will return False to advice user
            # via Warning
            # Thanks to @legalsylvain to warning about this use case
            if float_compare(order.amount_tax, amount_tax,
                             precision_digits=precision_digits):
                _logger.warning(
                    'Taxes assigned to some products have been changed, so '
                    'POS order (%d, %s, %s) has incorrect tax information.' %
                    (order.id, order.name, order.pos_reference))
                result = False
        return result

    @api.multi
    def action_paid(self):
        super(PosOrder, self).action_paid()
        if not self.compute_tax_detail():
            raise Warning(_('Taxes assigned to some products have been '
                            'changed during POS session'))
        return True

    @api.model
    def _install_tax_detail(self):
        """Create tax details to pos.order's already paid, done or invoiced.
        """
        # Find orders with state : paid, done or invoiced
        orders = self.search([('state', 'in', ('paid', 'done', 'invoiced'))])
        # Compute tax detail
        for order in orders:
            if not order.compute_tax_detail():
                _logger.warning(
                    'Taxes assigned to some products have been changed, so '
                    'POS order (%d, %s, %s) has incorrect tax information.' %
                    (order.id, order.name, order.pos_reference))
        _logger.info("%d orders computed installing module.", len(orders))
