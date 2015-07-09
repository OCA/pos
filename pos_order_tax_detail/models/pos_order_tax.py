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

from openerp import models, fields
from openerp.addons import decimal_precision as dp


class PosOrderTax(models.Model):
    _name = 'pos.order.tax'

    pos_order = fields.Many2one('pos.order', string='POS Order',
                                ondelete='cascade', index=True)
    tax = fields.Many2one('account.tax', string='Tax')
    name = fields.Char(string='Tax Description', required=True)
    base = fields.Float(string='Base', digits=dp.get_precision('Account'))
    amount = fields.Float(string='Amount', digits=dp.get_precision('Account'))
