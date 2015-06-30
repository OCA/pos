# -*- encoding: utf-8 -*-
##############################################################################
#
#    POS To Sale Order module for Odoo
#    Copyright (C) 2014 AKRETION (<http://www.akretion.com>).
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
    'name': 'POS To Sale Order',
    'version': '1.0',
    'category': 'Point Of Sale',
    'author': 'Akretion, Odoo Community Association (OCA)',
    'website': 'http://www.akretion.com',
    'license': 'AGPL-3',
    'depends': ['point_of_sale',
                'sale_automatic_workflow',
                'sale_quick_payment',
                'account_bank_statement_sale_order',
                ],
    'data': ['sale_view.xml',
             'point_of_sale_view.xml',
             ],
    'demo': ['demo/res_partner_data.xml',
             'demo/pos_config_data.xml',
             ],
    'installable': True,
}
