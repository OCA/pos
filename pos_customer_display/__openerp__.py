# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2010 Tiny SPRL (<http://tiny.be>).
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
    'name': 'POS Customer Display',
    'version': '0.1',
    'category': 'Point Of Sale',
    'summary': 'Manage Customer Display device from POS front end',
    'description': """
POS Customer Display
====================

This module adds support for Customer Display in the Point of Sale. This module is designed to be installed on the *main Odoo server*. On the *POSbox*, you should install the module *hw_customer_display*.

The number of rows and cols of the Customer Display (usually 2 x 20) should be configured on the main Odoo server, in the menu Point of Sale > Configuration > Point of Sales.

It has been tested with a Bixolon BCD-1100 (http://www.bixolon.com/html/en/product/product_detail.xhtml?prod_id=61), but should support most serial and USB-serial LCD displays out-of-the-box or with inheritance of a few functions. To setup the BCD-1100 on Linux, you will find some technical instructions on this page : http://techtuxwords.blogspot.fr/2012/12/linux-and-bixolon-bcd-1100.html

This module has been developped during a POS code sprint at Akretion France from July 7th to July 10th 2014. This module is part of the POS project of the Odoo Community Association http://odoo-community.org/. You are invited to become a member and/or get involved in the Association !

Please contact Alexis de Lattre from Akretion <alexis.delattre@akretion.com> for any help or question about this module.
    """,
    'author': 'Aurélien DUMAINE',
    'depends': ['point_of_sale'],
	'data' : ['pos_customer_display.xml',
				'customer_display_view.xml'],
}
