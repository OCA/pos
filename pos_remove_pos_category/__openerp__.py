# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
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
    'name': 'POS Remove POS Category',
    'version': '8.0.0.1.0',
    'author': 'Akretion, Odoo Community Association (OCA)',
    'category': 'Sales Management',
    'depends': [
        'point_of_sale',
    ],
    'demo': [],
    'website': 'https://www.akretion.com',
    'data': [
        'point_of_sale_view.xml',
        'views/pos_category.xml',
    ],
    'installable': True,
}
