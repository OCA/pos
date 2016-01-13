# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2004-Today Apertoso NV (<http://www.apertoso.be>)
#    Copyright (C) 2016-Today La Louve (<http://www.lalouve.net/>)
#
#    @author: Jos DE GRAEVE (<Jos.DeGraeve@apertoso.be>)
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
    'name': 'Point of Sale Require Customer',
    'version': '9.0.2.0.0',
    'category': 'Point Of Sale',
    'summary': 'Point of Sale Require Customer',
    'author': 'Apertoso NV, La Louve, Odoo Community Association (OCA)',
    'website': 'http://www.apertoso.be',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'static/src/xml/templates.xml',
        'views/pos_config_view.xml',
        'views/pos_order_view.xml',
    ],
    'demo': [
        'demo/pos_config.yml',
    ],
    'installable': True,
}
