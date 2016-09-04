# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2004-2014 Apertoso NV (<http://www.apertoso.be>).
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

{
    'name': 'Point of Sale Require Customer',
    'version': '1.0.1',
    'category': 'Point Of Sale',
    'sequence': 6,
    'summary': 'Point of Sale Require Customer',
    'description': """
Require customer for pos
========================

This module allows you to require a customer for each pos order.  In the
pos session configuration, you can choose to require the customer for pos
orders.

If a customer is not selected, the pos ui will display an error message.
In the backend the customer field is required when needed.

    """,
    'author': 'Apertoso NV, Odoo Community Association (OCA)',
    'images': [],
    'depends': ['point_of_sale'],
    'data': [
        'static/src/xml/templates.xml',
        'views/pos_view.xml',
    ],
    'demo': [],
    'test': [],
    'installable': False,
    'application': True,
    'qweb': [],
    'website': 'http://www.apertoso.be',
    'auto_install': False,
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
