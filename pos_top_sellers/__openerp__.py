# -*- coding: utf-8 -*-
###############################################################################
#
#   Copyright (C) 2015 initOS GmbH(<http://www.initos.com>).
#
#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU Affero General Public License as
#   published by the Free Software Foundation, either version 3 of the
#   License, or (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU Affero General Public License for more details.
#
#   You should have received a copy of the GNU Affero General Public License
#   along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
###############################################################################

{
    'name': 'Point of sale topseller report.',
    'version': '1.0',
    'category': '',
    'summary': 'Report topseller products in point of sale for all shops.',
    'description': """
Report top selling products for point of sale
=============================================

This module adds 2 new reports to report sales done via point of sale for all
of your companies shops.

Top 40 sales by shop
--------------------
* List top 40 sold products in a given period for all of your shops.
* Click on a product to show sales for this product by shop on a daily basis
  over that timeframe.

Recent sales by shop for a given product
----------------------------------------
* Show sales for a product by shop on a daily basis over a given period.
* Select product by product default code.
* Show current stock and total quantity of sales for this product and period.
""",
    'author': 'initOS GmbH',
    'website': 'http://www.initos.com',
    'depends': [
        'web',
        'web_listview_date_range_bar',
        'sale',
        'product',
        'point_of_sale',
    ],
    'data': [
        'ir.model.access.csv',
        'pos_top_sellers_view.xml',
    ],
    'demo': [
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
    'images': [
    ],
    'css': [
        'static/src/css/pos_top_sellers.css',
    ],
    'js': [
        'static/src/js/pos_top_sellers.js',
    ],
    'qweb': [
        'static/src/xml/pos_top_sellers.xml',
    ],
}
