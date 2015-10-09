# -*- encoding: utf-8 -*-
##############################################################################
#
#    Hardware Customer Display module for Odoo
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
    'version': '8.0.0.1.0',
    'category': 'Hardware Drivers',
    'license': 'AGPL-3',
    'summary': 'Adds support for Customer Display in the Point of Sale',
    'description': """
Hardware Customer Display
=========================

This module adds support for Customer Display in the Point of Sale.
This module is designed to be installed on the *POSbox* (i.e. the
proxy on which the USB devices are connected) and not on the main
Odoo server. On the main Odoo server, you should install the module
*pos_customer_display*.

The configuration of the hardware is done in the configuration file of
the Odoo server of the POSbox. You should add the following entries in
the configuration file:

* customer_display_device_name (default = /dev/ttyUSB0)
* customer_display_device_rate (default = 9600)
* customer_display_device_timeout (default = 2 seconds)

The number of cols of the Customer Display (usually 20) should be
configured on the main Odoo server, in the menu Point of Sale >
Configuration > Point of Sales. The number of rows is supposed to be 2.

It should support most serial and USB-serial LCD displays out-of-the-box
or with inheritance of a few functions.

It has been tested with:

* Bixolon BCD-1100 (Datasheet :
  http://www.bixolon.com/html/en/product/product_detail.xhtml?prod_id=61)
* Bixolon BCD-1000

To setup the BCD-1100 on Linux, you will find some technical instructions
on this page:
http://techtuxwords.blogspot.fr/2012/12/linux-and-bixolon-bcd-1100.html

If you have a kernel >= 3.12, you should also read this:
http://www.leniwiec.org/en/2014/06/25/ubuntu-14-04lts-how-to-pass-id-ven
dor-and-id-product-to-ftdi_sio-driver/

This module has been developped during a POS code sprint at Akretion
France from July 7th to July 10th 2014. This module is part of the POS
project of the Odoo Community Association http://odoo-community.org/.
You are invited to become a member and/or get involved in the
Association !

This module has been written by Alexis de Lattre from Akretion
<alexis.delattre@akretion.com>.
    """,
    'author': "Akretion,Odoo Community Association (OCA)",
    'website': 'http://www.akretion.com',
    'depends': ['hw_proxy'],
    'external_dependencies': {
        'python': ['serial', 'unidecode'],
    },
    'data': [],
}
