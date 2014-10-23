# -*- coding: utf-8 -*-
##############################################################################
#
#    POS Payment Terminal module for Odoo
#    Copyright (C) 2014 Aurélien DUMAINE
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
    'name': 'POS Payment Terminal',
    'version': '0.1',
    'category': 'Point Of Sale',
    'summary': 'Manage Payment Terminal device from POS front end',
    'description': """
POS Payment Terminal
====================

This module adds support for Payment Terminal in the Point of Sale. This module is designed to be installed on the *main Odoo server*. On the *POSbox*, you should install the module  *hw_x* depending on the protocol implemented in your device. Ingenico and Sagem devices support the Telium protocol implemented in the *hw_telium_payment_terminal* module.

This module support two payment methods : cards and checks. The payment method should be configured on the main Odoo server, in the menu Point of Sale > Configuration > Payment Methods.

This module has been developped during a POS code sprint at Akretion France from July 7th to July 10th 2014. This module is part of the POS project of the Odoo Community Association http://odoo-community.org/. You are invited to become a member and/or get involved in the Association !
    """,
    'author': 'Aurélien DUMAINE',
    'depends': ['point_of_sale'],
    'data': [
        'pos_payment_terminal.xml',
        'pos_payment_terminal_view.xml',
        ],
    'qweb': ['static/src/xml/pos_payment_terminal.xml'],
}
