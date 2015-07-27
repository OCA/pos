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
    'name': 'POS Order Load and Save',
    'version': '0.2',
    'author': 'Akretion,GRAP,Odoo Community Association (OCA)',
    'category': 'Point Of Sale',
    'depends': [
        'point_of_sale',
    ],
    'website': 'https://www.akretion.com',
    'data': [
        'view/pos_order_load.xml',
    ],
    'qweb': [
        'static/src/xml/pos_order_load.xml',
    ],
}
