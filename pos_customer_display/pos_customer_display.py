# -*- coding: utf-8 -*-
##############################################################################
#
#    POS Customer Display module for Odoo
#    Copyright (C) 2014 Aurélien DUMAINE
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
from openerp.osv import fields, orm

_logger = logging.getLogger(__name__)


class pos_config(orm.Model):
    _name = 'pos.config'
    _inherit = 'pos.config'

    _columns = {
        'iface_customer_display': fields.boolean(
            'Customer display', help="Display data on the customer display"),
        'customer_display_line_length': fields.integer(
            'Line length',
            help="Length of the LEDs lines of the customer display"),
    }

    _defaults = {
        'customer_display_line_length': 20,
    }

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
