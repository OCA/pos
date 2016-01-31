# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2016-Today La Louve (<http://www.lalouve.net/>)
#
#    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
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
    'name': 'Point of Sale - Session Summary',
    'version': '9.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Point of Sale - Total of transactions and Orders Quantity',
    'author': 'La Louve, Odoo Community Association (OCA)',
    'website': 'http://www.lalouve.net/',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/pos_session_view.xml',
    ],
    'installable': True,
}
