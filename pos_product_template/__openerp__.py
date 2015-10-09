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
    'version': '8.0.0.2.0',
    'category': 'Point Of Sale',
    'description': """
Manage Product Template in Front End Point Of Sale
==================================================

Functionality:
--------------
    * In Point Of Sale Front End - Products list:
        * Display only one product per template;
        * Display template name instead of product name;
        * Display products quantity instead of price;
        * Click on template displays an extra screen to select Variant;

    * In Point Of Sale Front End - Variants list:
        * Display all the products of the selected variant;
        * Click on a attribute value filters products;
        * Click on a product adds it to the current Order or display normal
          extra screen if it is a weightable product;

Technical Information:
----------------------
    * Load extra model in Point Of Sale Front End:
        * product.template;
        * product.attribute;
        * product.attribute.value;

Copyright, Authors and Licence:
-------------------------------
    * Copyright: 2014-Today, Akretion;
    * Author:
        * Sylvain LE GAL (https://twitter.com/legalsylvain);
    * Licence: AGPL-3 (http://www.gnu.org/licenses/);""",
    'author': "Akretion,Odoo Community Association (OCA)",
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
        'demo/product_attribute_value.yml',
        'demo/product_product.yml',
        'demo/res_groups.yml',
    ],
    'images': [
        'static/src/img/screenshots/pos_product_template.png',
    ],
}
