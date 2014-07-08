# -*- encoding: utf-8 -*-
##############################################################################
#
#    Hardware Customer Display module for OpenERP
#    Copyright (C) 2014 Akretion (http://www.akretion.com)
#    @author Alexis de Lattre <alexis.delattre@akretion.com>
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
    'name': 'Hardware Customer Display',
    'version': '0.1',
    'category': 'Hardware Drivers',
    'license': 'AGPL-3',
    'summary': 'Adds a support for Customer LCD in Point of Sale',
    'description': """
Hardware Customer Display
=========================

This module adds support for Customer Display in the Point of Sale. It has been tested with a Bixolon BCD-1100 (http://www.bixolon.com/html/en/product/product_detail.xhtml?prod_id=61), but should support most serial and USB-serial LCD displays out-of-the-box or with inheritance of a few functions. This module is designed to be installed on the *POSbox* (i.e. the proxy on which the USB devices are connected) and not on the Odoo server.

The configuration of the hardware is done in the configuration file of the Odoo server of the POSbox. You should add the following entries in the configuration file:

* customer_display_device_name (default = /dev/ttyUSB0)
* customer_display_device_rate (default = 9600)
* customer_display_device_timeout (default = 2 seconds)
* customer_display_device_rows (default = 2)
* customer_display_device_cols (default = 20)

This module has been developped during a POS code sprint at Akretion France from July 7th to July 10th 2014.

Please contact Alexis de Lattre from Akretion <alexis.delattre@akretion.com> for any help or question about this module.
    """,
    'author': 'Akretion',
    'website': 'http://www.akretion.com',
    'depends': ['hw_proxy'],
    'external_dependencies': {
        'python' : ['serial', 'unidecode'],
    },
    'data': [],
    'active': False,
}
