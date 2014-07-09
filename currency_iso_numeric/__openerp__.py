# -*- encoding: utf-8 -*-
##############################################################################
#
#    Currency ISO Numeric module for Odoo
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
    'name': 'Currency ISO Numeric',
    'version': '0.1',
    'category': 'Currency',
    'license': 'AGPL-3',
    'summary': 'Adds ISO 4217 numeric codes on currencies',
    'description': """
Currency ISO Numeric
====================

This module adds a field *ISO Numeric Code* on currencies. This numeric ISO code is required by some applications ; for example, it is used in the Telium protocol for the communication between the Point of Sale and the credit card reader.

This module has been developped during a POS code sprint at Akretion France from July 7th to July 10th 2014.

Please contact Alexis de Lattre from Akretion <alexis.delattre@akretion.com> for any help or question about this module.
    """,
    'author': 'Akretion',
    'website': 'http://www.akretion.com',
    'depends': ['base'],
    'data': [
        'res_currency_data.xml',
        'res_currency_view.xml',
        ],
    'active': False,
}
