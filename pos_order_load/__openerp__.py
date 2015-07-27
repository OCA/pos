# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2014-TODAY Akretion (<http://www.akretion.com>).
#    Copyright (C) 2014 Sylvain Calador (sylvain.calador@akretion.com).
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
    'name': 'POS Order Load',
    'version': '0.1',
    'author': 'Akretion',
    'category': 'Sales Management',
    'depends': [
        'base',
        'decimal_precision',
        'point_of_sale',
        'product',
        'web',
    ],
    'demo': [],
    'website': 'https://www.akretion.com',
    'description': """
        This module allows to load existing POS order.
        In this version, when the loaded order
        is validated in the POS, a new one is created.
    """,
    'data': [
        'view/pos_order_load.xml',
    ],
    'qweb': [
        'static/src/xml/pos_order_load.xml',
    ],
    'test': [],
    'installable': True,
    'auto_install': False,
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
