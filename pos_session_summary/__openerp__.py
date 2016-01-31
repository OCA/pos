# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Point of Sale - Session Summary',
    'version': '9.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Point of Sale - Total of transactions and Orders Quantity',
    'author': 'La Louve, Odoo Community Association (OCA)',
    'website': 'http://www.lalouve.net/',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/pos_session_view.xml',
    ],
    'installable': True,
    'license': 'AGPL-3',
}
