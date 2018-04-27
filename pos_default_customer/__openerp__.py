# -*- coding: utf-8 -*-
##############################################################################
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
    'name': 'Point of Sale Default Customer',
    'summary': 'Default Customer in Point of Sale config',
    'version': '8.0.1.0.0',
	'website': 'https://github.com/OCA/pos',
    'category': 'Point Of Sale',
    'author': 'Digital5 S.L., Odoo Community Association (OCA)',
	'license': 'AGPL-3',
    'images': [],
    'depends': ['point_of_sale'],
    'data': [
        'static/src/xml/templates.xml',
        'views/pos_view.xml',
    ],
    'demo': [],
    'test': [],
    'installable': True,
    'application': False,
    'qweb': ['static/src/xml/templates.xml',],
    'js': ['static/src/js/pos_default_customer.js'],
    'auto_install': False,
}
