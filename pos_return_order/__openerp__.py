# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


{
    'name': 'Point of Sale Return Order',
    'version': '9.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Point of Sale Return Order',
    'author': 'La Louve, GRAP, Odoo Community Association (OCA)',
    'website': 'http://www.lalouve.net',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/action.xml',
        'views/pos_order_view.xml',
        'views/pos_order_line_view.xml',
        'views/product_product_view.xml',
        'views/pos_partial_return_wizard_view.xml',
    ],
    'demo': [
        'demo/product_product.xml',
    ],
    'installable': True,
}
