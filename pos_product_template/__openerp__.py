# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Product Template module for Odoo
#    Copyright (C) 2014-Today Akretion (http://www.akretion.com)
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
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
    'name': 'Point Of Sale - Product Template',
    'summary': 'Manage Product Template in Front End Point Of Sale',
    'version': '0.1',
    'category': 'Point Of Sale',
    'description': """
Manage Product Template in Front End Point Of Sale
==================================================

Functionality:
--------------
    *

Possible improvements and fix:
------------------------------
    * Display product template name in ProductList;
    * Display attributes;
    * Improve Template display;

NON Covered features:
---------------------
    *

Copyright, Authors and Licence:
-------------------------------
    * Copyright: 2014-Today, Akretion;
    * Author:
        * Sylvain LE GAL (https://twitter.com/legalsylvain);
    * Licence: AGPL-3 (http://www.gnu.org/licenses/);""",
    'author': 'Akretion',
    'website': 'http://www.akretion.com',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'view/view.xml',
    ],
    'qweb': [
        'static/src/xml/ppt.xml',
    ],
    'demo': [
        'demo/product_product.yml',
        'demo/res_groups.yml',
    ],
}
