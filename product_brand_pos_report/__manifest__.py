# -*- coding: utf-8 -*-
# Copyright 2019 PlanetaTIC - Marc Poch <mpoch@planetatic.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Product Brand POS Report',
    'summary': 'Product Brand in Point of Sale Report',
    'version': '10.0.1.0.1',
    'description': 'Show product Brand in pos order report',
    'category': 'Point Of Sale',
    'author': 'PlanetaTIC, Odoo Community Association (OCA)',
    'website': 'https://www.github.com/OCA/pos',
    'license': 'AGPL-3',
    'application': False,
    'installable': True,
    'depends': [
        'point_of_sale',
        'product_brand',
    ],
    'data': [
        'reports/pos_order_report_view.xml',
    ],
}
