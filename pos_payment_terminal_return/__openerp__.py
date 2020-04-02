# -*- coding: utf-8 -*-
##############################################################################
#
#    POS Payment Terminal module for Odoo
#    Copyright (C) 2016-Today Julius Network Solutions
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
    'name': 'POS Payment Terminal Return',
    'version': '9.0.0.1.0',
    'category': 'Point Of Sale',
    'summary': 'Manage Payment Terminal device from POS front end with return',
    'author': "Julius Network Solutions",
    'contributors': "Mathieu Vatel <mathieu@julius.fr>",
    'license': 'AGPL-3',
    'depends': [
                'point_of_sale',
                'pos_payment_terminal',
                ],
    'data': [
             'pos_payment_terminal_view.xml',
             'static/src/xml/templates.xml',
             ],
    'installable': True,
}
