# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2015 initOS GmbH(<http://www.initos.com>).
#    Author Thomas Rehn <thomas.rehn at initos.com>
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
    'name': 'POS Local Storage Product Cache',
    'version': '0.1',
    'category': 'Point Of Sale',
    'author': 'initOS GmbH'
              'Odoo Community Association (OCA)',
    'description': """
Local Storage Cache for Point of Sale
=====================================

Stores product data in localStorage to improve booting time.
    """,
    'depends': ["point_of_sale",
                ],
    'data': [
    ],
    'js': [
        'static/src/js/models.js',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
