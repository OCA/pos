# -*- encoding: utf-8 -*-
##############################################################################
#
#    Hardware Telium Payment Terminal module for Odoo
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
    'name': 'Hardware Telium Payment Terminal',
    'version': '8.0.0.1.0',
    'category': 'Hardware Drivers',
    'license': 'AGPL-3',
    'summary': 'Adds support for Payment Terminals using Telium protocol',
    'description': """
Hardware Telium Payment Terminal
================================

This module adds support for credit card reader and checks printers
using Telium protocol in the Point of Sale. This module is designed to
be installed on the *POSbox* (i.e. the proxy on which the USB devices
are connected) and not on the main Odoo server. On the main Odoo server,
you should install the module *pos_payment_terminal*.

The configuration of the hardware is done in the configuration file of
the Odoo server of the POSbox. You should add the following entries in
the configuration file:

* payment_terminal_device_name (default = /dev/ttyACM0)
* payment_terminal_device_rate (default = 9600)

The Telium protocol is used by Ingenico and Sagem payment terminals. It
is based on the Concert protocol, so it can probably work with payment
terminals from other brands. This module implements the protocol E+ (and
not the protocol E), so it requires a Telium Manager version 37783600
or superior. To get the version of the Telium Manager on an Ingenico
terminal press F > 0-TELIUM MANAGER > 2-Consultation > 4-Configuration
> 2-Software > 1-TERMINAL > On Display > Telium Manager and then read
the field *M20S*.

You will need to configure your payment terminal to accept commands
from the POS. On an Ingenico terminal press F > 0-TELIUM MANAGER >
5-Initialization > 1-Parameters > Cash Connection and then select *On*
and then *USB*. After that, you should reboot the terminal.

This module has been successfully tested with:

* Ingenico EFTSmart4S
* Ingenico EFTSmart2 2640 with Telim Manager version 37784503
* Ingenico iCT220
* Ingenico iCT250
* Ingenico i2200 cheque reader and writer

This module has been developped during a POS code sprint at Akretion
France from July 7th to July 10th 2014. This module is part of the POS
project of the Odoo Community Association http://odoo-community.org/.
You are invited to become a member and/or get involved in the
Association !

This module has been written by Alexis de Lattre
<alexis.delattre@akretion.com> from Akretion.
    """,
    'author': "Akretion,Odoo Community Association (OCA)",
    'website': 'http://www.akretion.com',
    'depends': ['hw_proxy'],
    'external_dependencies': {
        'python': ['serial', 'pycountry'],
    },
    'data': [],
}
