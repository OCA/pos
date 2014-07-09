# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2010 Tiny SP (<http://tiny.be>).
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

import logging
import time

from openerp import tools
from openerp.osv import fields, osv
from openerp.tools.translate import _

import openerp.addons.decimal_precision as dp
import openerp.addons.product.product

_logger = logging.getLogger(__name__)

class pos_config(osv.osv):
    _name = 'pos.config'
    _inherit = 'pos.config'
      
    _columns = {
        'iface_customer_display' : fields.boolean('Customer display', help="Display data on the customer display"),
        'customer_display_line_length' : fields.integer('Line length', help="Length of the LEDs lines of the customer display"),
    }
    _defaults = {
        'customer_display_line_length' : 20,
    }

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
